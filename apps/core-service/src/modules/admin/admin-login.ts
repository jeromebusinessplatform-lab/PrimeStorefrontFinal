import { verifyAdminAccessCode } from "../security/admin-access-code";
import { createAdminSession, ADMIN_SESSION_ABSOLUTE_SECONDS } from "../security/admin-session";

interface LoginEnv {
  DB: Parameters<typeof createAdminSession>[0];
  ADMIN_ACCESS_CODE_VERIFIER: string;
}

interface VerifierConfig {
  salt: Uint8Array;
  hash: string;
  iterations: number;
}

function decodeBase64Url(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function parseVerifier(value: string): VerifierConfig {
  const [version, algorithm, iterationsRaw, salt, hash] = value.split(":");
  const iterations = Number.parseInt(iterationsRaw ?? "", 10);
  if (version !== "v1" || algorithm !== "pbkdf2-sha256" || !Number.isSafeInteger(iterations) || iterations < 100_000 || !/^[0-9a-f]{64}$/i.test(hash ?? "") || !salt) {
    throw new Error("invalid_admin_verifier_config");
  }
  return { salt: decodeBase64Url(salt), hash: hash.toLowerCase(), iterations };
}

export async function handleAdminLogin(request: Request, env: LoginEnv): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json({ error: "json_required" }, { status: 415, headers: { "cache-control": "no-store" } });
  }

  let body: { accessCode?: unknown };
  try {
    body = await request.json() as { accessCode?: unknown };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  if (typeof body.accessCode !== "string" || body.accessCode.length === 0) {
    return Response.json({ error: "access_code_required" }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  const verifier = parseVerifier(env.ADMIN_ACCESS_CODE_VERIFIER);
  const valid = await verifyAdminAccessCode(body.accessCode, verifier.hash, verifier.salt, verifier.iterations);
  if (!valid) return Response.json({ error: "invalid_admin_access_code" }, { status: 401, headers: { "cache-control": "no-store" } });

  const session = await createAdminSession(env.DB);
  return Response.json(
    { ok: true, csrfToken: session.csrf, expiresIn: ADMIN_SESSION_ABSOLUTE_SECONDS },
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "set-cookie": session.cookie,
      },
    },
  );
}
