import { validateAdminSession } from "./admin-session";

export interface AdminSessionContext {
  readonly sessionId: string;
}

export async function requireAdminSession(db: Parameters<typeof validateAdminSession>[0], request: Request): Promise<AdminSessionContext> {
  const session = await validateAdminSession(db, request);
  if (!session) {
    throw new Response(JSON.stringify({ error: "admin_auth_required" }), {
      status: 401,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
  return Object.freeze({ sessionId: session.id });
}

export function requireAdminCsrf(
  request: Request,
  sessionCsrfDigest: string,
): Promise<void> {
  const supplied = request.headers.get("X-PRIME-CSRF");
  if (!supplied) throw new Response(JSON.stringify({ error: "csrf_required" }), { status: 403 });
  return hashAndCompare(supplied, sessionCsrfDigest).then((valid) => {
    if (!valid) throw new Response(JSON.stringify({ error: "csrf_invalid" }), { status: 403 });
  });
}

async function hashAndCompare(value: string, expectedHex: string): Promise<boolean> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const actual = Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
  if (actual.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) diff |= actual.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  return diff === 0;
}
