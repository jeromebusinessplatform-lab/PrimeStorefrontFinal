import { handleAdminLogin } from "./modules/admin/admin-login";
import { validateAdminSession, ADMIN_SESSION_COOKIE } from "./modules/security/admin-session";
import { handleTelegramCustomerExchange } from "./modules/auth/telegram-exchange";
import { validateCustomerSession, CUSTOMER_SESSION_COOKIE } from "./modules/identity/customer-session";
import { createCourier, createWarehouse, deactivateCourier, deactivateWarehouse, listCouriers, listWarehouses, setDefaultWarehouse } from "./modules/delivery/delivery-config-store";
import type { CourierType } from "./modules/delivery/delivery-config";

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

async function parseJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) throw new Error("json_required");
  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid_json");
  return body as Record<string, unknown>;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeSafeInt(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

async function requireAdmin(env: Env, request: Request): Promise<boolean> {
  if (!env.DB) return false;
  return Boolean(await validateAdminSession(env.DB, request));
}

async function handleAdminDelivery(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonError("database_unavailable", 503);
  if (!(await requireAdmin(env, request))) return jsonError("admin_auth_required", 401);

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/admin\/delivery\/?/, "");
  try {
    if (path === "warehouses" && request.method === "GET") {
      return Response.json({ warehouses: await listWarehouses(env.DB) }, { headers: { "cache-control": "no-store" } });
    }
    if (path === "couriers" && request.method === "GET") {
      return Response.json({ couriers: await listCouriers(env.DB) }, { headers: { "cache-control": "no-store" } });
    }
    if (path === "warehouses" && request.method === "POST") {
      const body = await parseJson(request);
      if (!isString(body.name) || !isString(body.address) || typeof body.latitude !== "number" || typeof body.longitude !== "number") return jsonError("invalid_warehouse", 400);
      const result = await createWarehouse(env.DB, {
        name: body.name,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        isDefault: body.isDefault === true,
        isActive: body.isActive !== false,
      });
      return Response.json(result, { status: 201, headers: { "cache-control": "no-store" } });
    }
    if (path === "couriers" && request.method === "POST") {
      const body = await parseJson(request);
      if (!isString(body.name) || !["standard", "express", "priority"].includes(body.type as string)
        || !isNonNegativeSafeInt(body.baseFeeMinor) || !isNonNegativeSafeInt(body.perKmRateMinor)
        || !isNonNegativeSafeInt(body.platformFeeMinor ?? 0) || !isNonNegativeSafeInt(body.surchargeMinor ?? 0)) {
        return jsonError("invalid_courier", 400);
      }
      const result = await createCourier(env.DB, {
        name: body.name,
        type: body.type as CourierType,
        logoObjectKey: isString(body.logoObjectKey) ? body.logoObjectKey : null,
        baseFeeMinor: body.baseFeeMinor,
        perKmRateMinor: body.perKmRateMinor,
        platformFeeMinor: body.platformFeeMinor ?? 0,
        surchargeMinor: body.surchargeMinor ?? 0,
        isActive: body.isActive !== false,
      });
      return Response.json(result, { status: 201, headers: { "cache-control": "no-store" } });
    }

    const warehouseMatch = path.match(/^warehouses\/([^/]+)\/(default|deactivate)$/);
    if (warehouseMatch && request.method === "POST") {
      const [, warehouseId, action] = warehouseMatch;
      const result = action === "default"
        ? await setDefaultWarehouse(env.DB, warehouseId)
        : await deactivateWarehouse(env.DB, warehouseId);
      return Response.json(result, { headers: { "cache-control": "no-store" } });
    }

    const courierMatch = path.match(/^couriers\/([^/]+)\/deactivate$/);
    if (courierMatch && request.method === "POST") {
      const result = await deactivateCourier(env.DB, courierMatch[1]);
      return Response.json(result, { headers: { "cache-control": "no-store" } });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "delivery_operation_failed";
    if (["json_required", "invalid_json", "invalid_warehouse", "invalid_courier", "warehouse_name_required", "warehouse_address_required", "invalid_warehouse_latitude", "invalid_warehouse_longitude", "invalid_courier_type", "invalid_courier_baseFeeMinor", "invalid_courier_perKmRateMinor", "invalid_courier_platformFeeMinor", "invalid_courier_surchargeMinor"].includes(message)) {
      return jsonError(message, 400);
    }
    if (["warehouse_not_found", "courier_not_found"].includes(message)) return jsonError(message, 404);
    if (["warehouse_inactive", "default_warehouse_cannot_be_deactivated", "default_warehouse_not_configured"].includes(message)) return jsonError(message, 409);
    return jsonError(message, 500);
  }

  return jsonError("not_found", 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "prime-core-service", env: env.APP_ENV });
    }
    if (!env.DB) return jsonError("database_unavailable", 503);

    if (url.pathname.startsWith("/admin/delivery/")) return handleAdminDelivery(request, env);

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
