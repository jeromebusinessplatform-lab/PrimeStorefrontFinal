import { handleAdminLogin } from "./modules/admin/admin-login";
import { validateAdminSession, ADMIN_SESSION_COOKIE } from "./modules/security/admin-session";
import { handleTelegramCustomerExchange } from "./modules/auth/telegram-exchange";
import { validateCustomerSession, CUSTOMER_SESSION_COOKIE } from "./modules/identity/customer-session";
import { createDeliveryQuote, applyCheckoutDeliveryQuote } from "./modules/delivery/delivery-quote";
import { createCourier, createWarehouse, deactivateCourier, deactivateWarehouse, listCouriers, listWarehouses, setDefaultWarehouse, updateCourier, updateWarehouse } from "./modules/delivery/delivery-config-store";
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
  GEOAPIFY_API_KEY?: string;
}

function jsonError(error: string, status: number): Response { return Response.json({ error }, { status, headers: { "cache-control": "no-store" } }); }
async function parseJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) throw new Error("json_required");
  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid_json");
  return body as Record<string, unknown>;
}
function isString(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function isNonNegativeSafeInt(value: unknown): value is number { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0; }
function isFiniteNumber(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
async function requireAdmin(env: Env, request: Request): Promise<boolean> { return Boolean(env.DB && await validateAdminSession(env.DB, request)); }

async function handleAdminDelivery(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonError("database_unavailable", 503);
  if (!(await requireAdmin(env, request))) return jsonError("admin_auth_required", 401);
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/admin\/delivery\/?/, "");
  try {
    if (path === "warehouses" && request.method === "GET") return Response.json({ warehouses: await listWarehouses(env.DB) }, { headers: { "cache-control": "no-store" } });
    if (path === "couriers" && request.method === "GET") return Response.json({ couriers: await listCouriers(env.DB) }, { headers: { "cache-control": "no-store" } });
    if (path === "warehouses" && request.method === "POST") {
      const body = await parseJson(request);
      const latitude = body.latitude;
      const longitude = body.longitude;
      if (!isString(body.name) || !isString(body.address) || !isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return jsonError("invalid_warehouse", 400);
      return Response.json(await createWarehouse(env.DB, { name: body.name, address: body.address, latitude, longitude, isDefault: body.isDefault === true, isActive: body.isActive !== false }), { status: 201, headers: { "cache-control": "no-store" } });
    }
    const warehouseMatch = path.match(/^warehouses\/([^/]+)$/);
    if (warehouseMatch && request.method === "PATCH") {
      const body = await parseJson(request);
      const patch: Parameters<typeof updateWarehouse>[2] = {};
      if (body.name !== undefined) { if (!isString(body.name)) return jsonError("invalid_warehouse_name", 400); patch.name = body.name; }
      if (body.address !== undefined) { if (!isString(body.address)) return jsonError("invalid_warehouse_address", 400); patch.address = body.address; }
      if (body.latitude !== undefined) { if (!isFiniteNumber(body.latitude)) return jsonError("invalid_warehouse_latitude", 400); patch.latitude = body.latitude; }
      if (body.longitude !== undefined) { if (!isFiniteNumber(body.longitude)) return jsonError("invalid_warehouse_longitude", 400); patch.longitude = body.longitude; }
      if (body.isActive !== undefined) { if (typeof body.isActive !== "boolean") return jsonError("invalid_warehouse_active", 400); patch.isActive = body.isActive; }
      if (body.isDefault !== undefined) { if (typeof body.isDefault !== "boolean") return jsonError("invalid_warehouse_default", 400); patch.isDefault = body.isDefault; }
      return Response.json(await updateWarehouse(env.DB, warehouseMatch[1], patch), { headers: { "cache-control": "no-store" } });
    }
    if (path === "couriers" && request.method === "POST") {
      const body = await parseJson(request);
      const type = body.type;
      const baseFeeMinor = body.baseFeeMinor;
      const perKmRateMinor = body.perKmRateMinor;
      const platformFeeMinor = body.platformFeeMinor ?? 0;
      const surchargeMinor = body.surchargeMinor ?? 0;
      if (!isString(body.name) || !["standard", "express", "priority"].includes(type as string) || !isNonNegativeSafeInt(baseFeeMinor) || !isNonNegativeSafeInt(perKmRateMinor) || !isNonNegativeSafeInt(platformFeeMinor) || !isNonNegativeSafeInt(surchargeMinor)) return jsonError("invalid_courier", 400);
      return Response.json(await createCourier(env.DB, { name: body.name, type: type as CourierType, logoObjectKey: isString(body.logoObjectKey) ? body.logoObjectKey : null, baseFeeMinor, perKmRateMinor, platformFeeMinor, surchargeMinor, isActive: body.isActive !== false }), { status: 201, headers: { "cache-control": "no-store" } });
    }
    const courierMatch = path.match(/^couriers\/([^/]+)$/);
    if (courierMatch && request.method === "PATCH") {
      const body = await parseJson(request);
      const patch: Parameters<typeof updateCourier>[2] = {};
      if (body.name !== undefined) { if (!isString(body.name)) return jsonError("invalid_courier_name", 400); patch.name = body.name; }
      if (body.type !== undefined) { if (!["standard", "express", "priority"].includes(body.type as string)) return jsonError("invalid_courier_type", 400); patch.type = body.type as CourierType; }
      if (body.logoObjectKey !== undefined) { if (body.logoObjectKey !== null && !isString(body.logoObjectKey)) return jsonError("invalid_courier_logo", 400); patch.logoObjectKey = body.logoObjectKey as string | null; }
      for (const [key, error] of [["baseFeeMinor", "invalid_courier_baseFeeMinor"], ["perKmRateMinor", "invalid_courier_perKmRateMinor"], ["platformFeeMinor", "invalid_courier_platformFeeMinor"], ["surchargeMinor", "invalid_courier_surchargeMinor"]] as const) {
        if (body[key] !== undefined) { if (!isNonNegativeSafeInt(body[key])) return jsonError(error, 400); (patch as Record<string, unknown>)[key] = body[key]; }
      }
      if (body.isActive !== undefined) { if (typeof body.isActive !== "boolean") return jsonError("invalid_courier_active", 400); patch.isActive = body.isActive; }
      return Response.json(await updateCourier(env.DB, courierMatch[1], patch), { headers: { "cache-control": "no-store" } });
    }
    const warehouseAction = path.match(/^warehouses\/([^/]+)\/(default|deactivate)$/);
    if (warehouseAction && request.method === "POST") {
      const [, warehouseId, action] = warehouseAction;
      return Response.json(action === "default" ? await setDefaultWarehouse(env.DB, warehouseId) : await deactivateWarehouse(env.DB, warehouseId), { headers: { "cache-control": "no-store" } });
    }
    const courierDeactivate = path.match(/^couriers\/([^/]+)\/deactivate$/);
    if (courierDeactivate && request.method === "POST") return Response.json(await deactivateCourier(env.DB, courierDeactivate[1]), { headers: { "cache-control": "no-store" } });
    if (path === "quote" && request.method === "POST") {
      if (!env.GEOAPIFY_API_KEY) return jsonError("geoapify_not_configured", 503);
      const body = await parseJson(request);
      const latitude = body.latitude;
      const longitude = body.longitude;
      if (!isString(body.courierId) || !isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return jsonError("invalid_delivery_quote", 400);
      return Response.json(await createDeliveryQuote(env.DB, { courierId: body.courierId, latitude, longitude }, env.GEOAPIFY_API_KEY), { headers: { "cache-control": "no-store" } });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "delivery_operation_failed";
    if (message === "geoapify_api_key_required" || message === "geoapify_route_failed" || message === "geoapify_route_invalid") return jsonError(message, 502);
    if (["json_required", "invalid_json", "invalid_warehouse", "invalid_courier", "warehouse_name_required", "warehouse_address_required", "invalid_warehouse_name", "invalid_warehouse_address", "invalid_warehouse_latitude", "invalid_warehouse_longitude", "invalid_warehouse_active", "invalid_warehouse_default", "invalid_courier_name", "invalid_courier_logo", "invalid_courier_type", "invalid_courier_baseFeeMinor", "invalid_courier_perKmRateMinor", "invalid_courier_platformFeeMinor", "invalid_courier_surchargeMinor", "invalid_courier_active", "invalid_delivery_quote", "invalid_destination_latitude", "invalid_destination_longitude", "invalid_route_distance", "invalid_route_duration"].includes(message)) return jsonError(message, 400);
    if (["warehouse_not_found", "courier_not_found"].includes(message)) return jsonError(message, 404);
    if (["warehouse_inactive", "default_warehouse_cannot_be_deactivated", "default_warehouse_not_configured"].includes(message)) return jsonError(message, 409);
    return jsonError(message, 500);
  }
  return jsonError("not_found", 404);
}

async function handleCustomerCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonError("database_unavailable", 503);
  const session = await validateCustomerSession(env.DB, request);
  if (!session) return jsonError("telegram_session_required", 401);
  if (!env.GEOAPIFY_API_KEY) return jsonError("geoapify_not_configured", 503);
  try {
    const body = await parseJson(request);
    const checkoutSessionId = body.checkoutSessionId;
    const courierId = body.courierId;
    const latitude = body.latitude;
    const longitude = body.longitude;
    if (!isString(checkoutSessionId) || !isString(courierId) || !isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return jsonError("invalid_delivery_quote", 400);
    return Response.json(await applyCheckoutDeliveryQuote(env.DB, {
      checkoutSessionId,
      customerId: session.customer_id,
      courierId,
      latitude,
      longitude,
    }, env.GEOAPIFY_API_KEY), { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "checkout_delivery_quote_failed";
    if (message === "checkout_forbidden") return jsonError(message, 403);
    if (["checkout_session_required", "customer_required", "invalid_delivery_quote", "invalid_customer_latitude", "invalid_customer_longitude"].includes(message)) return jsonError(message, 400);
    if (message === "checkout_not_found") return jsonError(message, 404);
    if (["default_warehouse_not_configured", "warehouse_inactive"].includes(message)) return jsonError(message, 409);
    if (message === "courier_not_found") return jsonError(message, 404);
    if (["geoapify_api_key_required", "geoapify_route_failed", "geoapify_route_invalid"].includes(message)) return jsonError(message, 502);
    return jsonError(message, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return Response.json({ ok: true, service: "prime-core-service", env: env.APP_ENV });
    if (!env.DB) return jsonError("database_unavailable", 503);
    if (url.pathname.startsWith("/admin/delivery/")) return handleAdminDelivery(request, env);
    if (url.pathname === "/customer/auth/exchange") {
      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_BOT_ID) return jsonError("telegram_auth_not_configured", 503);
      return handleTelegramCustomerExchange(request, { DB: env.DB, TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_ID: env.TELEGRAM_BOT_ID });
    }
    if (url.pathname === "/customer/checkout/delivery-quote" && request.method === "POST") return handleCustomerCheckout(request, env);
    if (url.pathname === "/admin/auth/login") {
      if (!env.ADMIN_ACCESS_CODE_VERIFIER) return jsonError("admin_auth_not_configured", 503);
      return handleAdminLogin(request, { DB: env.DB, ADMIN_ACCESS_CODE_VERIFIER: env.ADMIN_ACCESS_CODE_VERIFIER });
    }
    if (url.pathname === "/admin/auth/session" && request.method === "GET") {
      const session = await validateAdminSession(env.DB, request);
      if (!session) return jsonError("admin_auth_required", 401);
      return Response.json({ ok: true, sessionId: session.id }, { headers: { "cache-control": "no-store" } });
    }
    if (url.pathname === "/customer/auth/session" && request.method === "GET") {
      const session = await validateCustomerSession(env.DB, request);
      if (!session) return jsonError("telegram_session_required", 401);
      return Response.json({ ok: true, sessionId: session.id, customerId: session.customer_id }, { headers: { "cache-control": "private, no-store" } });
    }
    const adminCookiePresent = request.headers.get("Cookie")?.includes(`${ADMIN_SESSION_COOKIE}=`) ?? false;
    const customerCookiePresent = request.headers.get("Cookie")?.includes(`${CUSTOMER_SESSION_COOKIE}=`) ?? false;
    if (adminCookiePresent || customerCookiePresent) return jsonError("route_not_implemented", 501);
    return jsonError("not_found", 404);
  },
};
