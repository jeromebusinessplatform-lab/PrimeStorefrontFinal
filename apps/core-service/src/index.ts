import { handleAdminLogin } from "./modules/admin/admin-login";
import { validateAdminSession, ADMIN_SESSION_COOKIE } from "./modules/security/admin-session";
import { handleTelegramCustomerExchange } from "./modules/auth/telegram-exchange";
import { validateCustomerSession, CUSTOMER_SESSION_COOKIE } from "./modules/identity/customer-session";

export interface Env {
  APP_ENV: string;
  PUBLIC_APP_NAME?: string;
  PUBLIC_DEFAULT_LOCALE?: string;
  PUBLIC_DEFAULT_CURRENCY?: string;
  PUBLIC_DEFAULT_TIMEZONE?: string;
  DB?: D1Database;
  OBJECTS?: R2Bucket;
  JOBS?: Queue;
  ADMIN_ACCESS_CODE_VERIFIER?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_BOT_ID?: string;
}

function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "prime-core-service", env: env.APP_ENV });
    }
    if (!env.DB) return jsonError("database_unavailable", 503);

    if (url.pathname === "/admin/auth/login") {
      if (!env.ADMIN_ACCESS_CODE_VERIFIER) return jsonError("admin_auth_not_configured", 503);
      return handleAdminLogin(request, {
        DB: env.DB,
        ADMIN_ACCESS_CODE_VERIFIER: env.ADMIN_ACCESS_CODE_VERIFIER,
      });
    }

    if (url.pathname === "/admin/auth/session" && request.method === "GET") {
      const session = await validateAdminSession(env.DB, request);
      if (!session) return jsonError("admin_auth_required", 401);
      return Response.json({ ok: true, sessionId: session.id }, { headers: { "cache-control": "no-store" } });
    }

    if (url.pathname === "/customer/auth/exchange") {
      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_BOT_ID) return jsonError("telegram_auth_not_configured", 503);
      return handleTelegramCustomerExchange(request, {
        DB: env.DB,
        TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_BOT_ID: env.TELEGRAM_BOT_ID,
      });
    }

    if (url.pathname === "/customer/auth/session" && request.method === "GET") {
      const session = await validateCustomerSession(env.DB, request);
      if (!session) return jsonError("telegram_session_required", 401);
      return Response.json({ ok: true, sessionId: session.id, customerId: session.customer_id }, { headers: { "cache-control": "private, no-store" } });
    }

    const adminCookiePresent = request.headers.get("Cookie")?.includes(`${ADMIN_SESSION_COOKIE}=`) ?? false;
    const customerCookiePresent = request.headers.get("Cookie")?.includes(`${CUSTOMER_SESSION_COOKIE}=`) ?? false;
    if (adminCookiePresent || customerCookiePresent) {
      return jsonError("route_not_implemented", 501);
    }
    return jsonError("not_found", 404);
  },
};
