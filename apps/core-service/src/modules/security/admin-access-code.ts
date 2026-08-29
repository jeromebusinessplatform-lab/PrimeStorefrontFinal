const textEncoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

export function normalizeAdminAccessCode(value: string): string {
  return value.normalize("NFKC").trim().toUpperCase();
}

export async function deriveAdminVerifier(
  accessCode: string,
  salt: Uint8Array,
  iterations = 310_000,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(normalizeAdminAccessCode(accessCode)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

export async function verifyAdminAccessCode(
  accessCode: string,
  expectedHex: string,
  salt: Uint8Array,
  iterations = 310_000,
): Promise<boolean> {
  const derived = await deriveAdminVerifier(accessCode, salt, iterations);
  const expected = new Uint8Array(
    expectedHex.match(/.{2}/g)?.map((value) => Number.parseInt(value, 16)) ?? [],
  );
  return timingSafeEqual(textEncoder.encode(derived), textEncoder.encode(bytesToHex(expected)));
}

export function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function digestToken(token: string): Promise<string> {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", textEncoder.encode(token))));
}

export function buildAdminSessionCookie(token: string, maxAgeSeconds: number): string {
  return [
    `prime_admin=${token}`,
    "Path=/",
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
  ].join("; ");
}
