import { verifyTelegramInitData } from "./telegram-init-data";
import { enrollCustomer } from "../identity/customer-enrollment";
import { generatePrimeMemberId } from "../identity/prime-member-id";
import { createCustomerSession, CUSTOMER_SESSION_ABSOLUTE_SECONDS } from "../identity/customer-session";

interface ExchangeEnv {
  DB: Parameters<typeof enrollCustomer>[0];
  TELEGRAM_BOT_TOKEN: string;
}

export async function handleTelegramCustomerExchange(request: Request, env: ExchangeEnv): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return Response.json({ error: "json_required" }, { status: 415, headers: { "cache-control": "no-store" } });
  }
  let body: { initData?: unknown };
  try {
    body = await request.json() as { initData?: unknown };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  if (typeof body.initData !== "string" || !body.initData) {
    return Response.json({ error: "telegram_init_data_required" }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  let verified;
  try {
    verified = await verifyTelegramInitData(body.initData, env.TELEGRAM_BOT_TOKEN);
  } catch {
    return Response.json({ error: "telegram_auth_required" }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    const enrollment = await enrollCustomer(env.DB, {
      telegramUserId: verified.user.id,
      firstName: verified.user.first_name,
      lastName: verified.user.last_name,
      username: verified.user.username,
      source: "mini_app_exchange",
      requestId: request.headers.get("x-request-id") ?? undefined,
    }, generatePrimeMemberId);
    const session = await createCustomerSession(env.DB, enrollment.customerId);
    return Response.json({ ok: true, primeMemberId: enrollment.primeMemberId, created: enrollment.created, expiresIn: CUSTOMER_SESSION_ABSOLUTE_SECONDS }, {
      headers: { "cache-control": "private, no-store", "set-cookie": session.cookie },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "enrollment_failed";
    return Response.json({ error: code }, { status: 409, headers: { "cache-control": "no-store" } });
  }
}
