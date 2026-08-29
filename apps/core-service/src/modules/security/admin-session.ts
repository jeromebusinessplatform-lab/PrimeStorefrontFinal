export const ADMIN_SESSION_COOKIE = "prime_admin";
export const ADMIN_SESSION_IDLE_SECONDS = 60 * 60 * 8;
export const ADMIN_SESSION_ABSOLUTE_SECONDS = 60 * 60 * 24;

interface AdminSessionRow {
  id: string;
  session_digest: string;
  csrf_digest: string;
  created_at: string;
  last_seen_at: string;
  idle_expires_at: string;
  absolute_expires_at: string;
  revoked_at?: string | null;
}

interface SessionDb {
  prepare(query: string): { bind(...values: unknown[]): { first<T = unknown>(): Promise<T | null>; run(): Promise<unknown> } };
}

function parseCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === ADMIN_SESSION_COOKIE) return value.join("=") || null;
  }
  return null;
}

function expiresAt(seconds: number, now = Date.now()): string {
  return new Date(now + seconds * 1000).toISOString();
}

export async function createAdminSession(db: SessionDb, now = Date.now()) {
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const csrf = crypto.randomUUID().replaceAll("-", "");
  const sessionId = crypto.randomUUID();
  const sessionDigest = await digestToken(token);
  const csrfDigest = await digestToken(csrf);
  const createdAt = new Date(now).toISOString();
  await db.prepare(
    "INSERT INTO admin_sessions (id, session_digest, csrf_digest, created_at, last_seen_at, idle_expires_at, absolute_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).bind(sessionId, sessionDigest, csrfDigest, createdAt, createdAt, expiresAt(ADMIN_SESSION_IDLE_SECONDS, now), expiresAt(ADMIN_SESSION_ABSOLUTE_SECONDS, now)).run();
  return { sessionId, token, csrf, cookie: buildAdminSessionCookie(token, ADMIN_SESSION_ABSOLUTE_SECONDS) };
}

export async function validateAdminSession(db: SessionDb, request: Request, now = Date.now()): Promise<AdminSessionRow | null> {
  const token = parseCookie(request.headers.get("Cookie"));
  if (!token) return null;
  const digest = await digestToken(token);
  const row = await db.prepare("SELECT id, session_digest, csrf_digest, created_at, last_seen_at, idle_expires_at, absolute_expires_at, revoked_at FROM admin_sessions WHERE session_digest = ? LIMIT 1").bind(digest).first<AdminSessionRow>();
  if (!row || row.revoked_at) return null;
  const nowIso = new Date(now).toISOString();
  if (row.idle_expires_at <= nowIso || row.absolute_expires_at <= nowIso) return null;
  await db.prepare("UPDATE admin_sessions SET last_seen_at = ?, idle_expires_at = ? WHERE id = ? AND revoked_at IS NULL").bind(nowIso, expiresAt(ADMIN_SESSION_IDLE_SECONDS, now), row.id).run();
  return row;
}

export async function revokeAdminSession(db: SessionDb, request: Request, now = new Date().toISOString()): Promise<void> {
  const token = parseCookie(request.headers.get("Cookie"));
  if (!token) return;
  const digest = await digestToken(token);
  await db.prepare("UPDATE admin_sessions SET revoked_at = ? WHERE session_digest = ? AND revoked_at IS NULL").bind(now, digest).run();
}

export async function digestToken(token: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildAdminSessionCookie(token: string, maxAgeSeconds: number): string {
  return [`${ADMIN_SESSION_COOKIE}=${token}`, "Path=/", `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`, "HttpOnly", "Secure", "SameSite=Strict"].join("; ");
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}
