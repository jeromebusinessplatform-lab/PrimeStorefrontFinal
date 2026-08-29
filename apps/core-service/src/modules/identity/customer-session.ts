export const CUSTOMER_SESSION_COOKIE = "prime_customer";
export const CUSTOMER_SESSION_IDLE_SECONDS = 60 * 60 * 8;
export const CUSTOMER_SESSION_ABSOLUTE_SECONDS = 60 * 60 * 24;

interface SessionDb {
  prepare(query: string): { bind(...values: unknown[]): { first<T = unknown>(): Promise<T | null>; run(): Promise<unknown> } };
}

export async function createCustomerSession(db: SessionDb, customerId: string, now = Date.now()) {
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const digest = await digestToken(token);
  const createdAt = new Date(now).toISOString();
  const sessionId = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO customer_sessions (id, customer_id, session_digest, created_at, last_seen_at, idle_expires_at, absolute_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).bind(sessionId, customerId, digest, createdAt, createdAt, expiresAt(CUSTOMER_SESSION_IDLE_SECONDS, now), expiresAt(CUSTOMER_SESSION_ABSOLUTE_SECONDS, now)).run();
  return { sessionId, token, cookie: buildCustomerSessionCookie(token, CUSTOMER_SESSION_ABSOLUTE_SECONDS) };
}

export async function validateCustomerSession(db: SessionDb, request: Request, now = Date.now()): Promise<{ id: string; customer_id: string } | null> {
  const token = readCookie(request.headers.get("Cookie"), CUSTOMER_SESSION_COOKIE);
  if (!token) return null;
  const digest = await digestToken(token);
  const row = await db.prepare("SELECT id, customer_id, idle_expires_at, absolute_expires_at, revoked_at FROM customer_sessions WHERE session_digest = ? LIMIT 1").bind(digest).first<{ id: string; customer_id: string; idle_expires_at: string; absolute_expires_at: string; revoked_at?: string | null }>();
  if (!row || row.revoked_at) return null;
  const nowIso = new Date(now).toISOString();
  if (row.idle_expires_at <= nowIso || row.absolute_expires_at <= nowIso) return null;
  await db.prepare("UPDATE customer_sessions SET last_seen_at = ?, idle_expires_at = ? WHERE id = ? AND revoked_at IS NULL").bind(nowIso, expiresAt(CUSTOMER_SESSION_IDLE_SECONDS, now), row.id).run();
  return { id: row.id, customer_id: row.customer_id };
}

export async function revokeCustomerSession(db: SessionDb, request: Request, now = new Date().toISOString()): Promise<void> {
  const token = readCookie(request.headers.get("Cookie"), CUSTOMER_SESSION_COOKIE);
  if (!token) return;
  await db.prepare("UPDATE customer_sessions SET revoked_at = ? WHERE session_digest = ? AND revoked_at IS NULL").bind(now, await digestToken(token)).run();
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [candidate, ...value] = part.trim().split("=");
    if (candidate === name) return value.join("=") || null;
  }
  return null;
}

async function digestToken(token: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

function expiresAt(seconds: number, now: number): string {
  return new Date(now + seconds * 1000).toISOString();
}

export function buildCustomerSessionCookie(token: string, maxAgeSeconds: number): string {
  return [`${CUSTOMER_SESSION_COOKIE}=${token}`, "Path=/", `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`, "HttpOnly", "Secure", "SameSite=Strict"].join("; ");
}
