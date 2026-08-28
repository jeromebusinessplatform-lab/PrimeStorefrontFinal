export interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface VerifiedInitData {
  auth_date: number;
  user: TelegramUser;
  queryId?: string;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(key: BufferSource, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function extractLosslessTelegramId(userJson: string): string {
  const match = userJson.match(/(?:^|\{)\s*\"id\"\s*:\s*(\d+)/);
  if (!match) throw new Error("invalid_user_id");
  return match[1];
}

export async function verifyTelegramInitData(raw: string, botToken: string, nowSeconds = Math.floor(Date.now() / 1000), maxAgeSeconds = 300): Promise<VerifiedInitData> {
  if (!raw || !botToken) throw new Error("invalid_auth_input");
  const params = new URLSearchParams(raw);
  const receivedHash = params.get("hash");
  if (!receivedHash || !/^[0-9a-f]{64}$/i.test(receivedHash)) throw new Error("invalid_hash");
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = await hmacSha256(new TextEncoder().encode(botToken), "WebAppData");
  const expectedHash = bytesToHex(await hmacSha256(secretKey, dataCheckString));
  if (!constantTimeEqualHex(receivedHash.toLowerCase(), expectedHash)) throw new Error("invalid_hash");

  const authDateRaw = params.get("auth_date");
  const authDate = authDateRaw && /^\d+$/.test(authDateRaw) ? Number(authDateRaw) : NaN;
  if (!Number.isSafeInteger(authDate) || authDate > nowSeconds + 30 || nowSeconds - authDate > maxAgeSeconds) throw new Error("stale_auth");

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("missing_user");
  const id = extractLosslessTelegramId(userRaw);
  const parsed = JSON.parse(userRaw) as { first_name?: unknown; last_name?: unknown; username?: unknown };
  if (typeof parsed.first_name !== "string" || parsed.first_name.length === 0) throw new Error("invalid_user");

  return {
    auth_date: authDate,
    user: {
      id,
      first_name: parsed.first_name,
      last_name: typeof parsed.last_name === "string" ? parsed.last_name : undefined,
      username: typeof parsed.username === "string" ? parsed.username : undefined,
    },
    queryId: params.get("query_id") ?? undefined,
  };
}
