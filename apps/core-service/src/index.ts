import { handleAdminLogin } from "./modules/admin/admin-login";
import { validateAdminSession, ADMIN_SESSION_COOKIE } from "./modules/security/admin-session";
import { handleTelegramCustomerExchange } from "./modules/auth/telegram-exchange";
import { validateCustomerSession, CUSTOMER_SESSION_COOKIE } from "./modules/identity/customer-session";
import { createDeliveryQuote, applyCheckoutDeliveryQuote } from "./modules/delivery/delivery-quote";
import { createCourier, createWarehouse, deactivateCourier, deactivateWarehouse, listCouriers, listWarehouses, setDefaultWarehouse, updateCourier, updateWarehouse } from "./modules/delivery/delivery-config-store";
import type { CourierType } from "./modules/delivery/delivery-config";
import { submitCheckout } from "./modules/checkout/checkout-submit";
import { createProduct, listProducts, type ProductBadge } from "./modules/catalog/catalog-store";
import { getLoyaltyConfiguration, updateLoyaltyConfiguration, type LoyaltyConfiguration } from "./modules/loyalty/loyalty-config-store";
import { handleCustomerCatalog, handleCustomerCouriers } from "./modules/storefront/storefront-routes";
import { uploadReceiptToR2, uploadReceiptToTelegram } from "./modules/integrations/receipt-upload";
import { handleAdminPaymentSettlement } from "./modules/admin/admin-payment-settlement";

export interface Env {
  APP_ENV: string;
  PUBLIC_APP_NAME?: string;
  PUBLIC_DEFAULT_LOCALE?: string;
  PUBLIC_DEFAULT_CURRENCY?: string;
  PUBLIC_DEFAULT_TIMEZONE?: string;
  DB?: D1Database;
  ASSETS?: Fetcher;
  OBJECTS?: R2Bucket;
  JOBS?: Queue;
  ADMIN_ACCESS_CODE_VERIFIER?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_RECEIPT_CHAT_ID?: string;
  GEOAPIFY_API_KEY?: string;
  TAGGUN_API_KEY?: string;
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

async function handleAdminCatalog(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonError("database_unavailable", 503);
  if (!(await requireAdmin(env, request))) return jsonError("admin_auth_required", 401);
  const path = new URL(request.url).pathname.replace(/^\/admin\/catalog\/?/, "");
  try {
    if (path === "products" && request.method === "GET") return Response.json({ products: await listProducts(env.DB) }, { headers: { "cache-control": "no-store" } });
    if (path === "products" && request.method === "POST") {
      const body = await parseJson(request);
      if (!isString(body.name) || !isNonNegativeSafeInt(body.priceMinor) || !isNonNegativeSafeInt(body.costMinor) || !isNonNegativeSafeInt(body.stocksAvailable) || !isNonNegativeSafeInt(body.lowStockThreshold)) return jsonError("invalid_product", 400);
      const badge = body.badge === undefined || body.badge === null ? null : body.badge as ProductBadge;
      const result = await createProduct(env.DB, {
        name: body.name,
        subname: body.subname === undefined || body.subname === null ? null : isString(body.subname) ? body.subname : undefined,
        categoryId: body.categoryId === undefined || body.categoryId === null ? null : isString(body.categoryId) ? body.categoryId : undefined,
        description: body.description === undefined || body.description === null ? null : isString(body.description) ? body.description : undefined,
        priceMinor: body.priceMinor,
        costMinor: body.costMinor,
        compareAtPriceMinor: body.compareAtPriceMinor === undefined || body.compareAtPriceMinor === null ? null : body.compareAtPriceMinor as number,
        stocksAvailable: body.stocksAvailable,
        lowStockThreshold: body.lowStockThreshold,
        sku: isString(body.sku) ? body.sku : undefined,
        barcode: body.barcode === undefined || body.barcode === null ? null : isString(body.barcode) ? body.barcode : undefined,
        taxInclusive: body.taxInclusive !== false,
        imageObjectKey: body.imageObjectKey === undefined || body.imageObjectKey === null ? null : isString(body.imageObjectKey) ? body.imageObjectKey : undefined,
        badge,
      });
      return Response.json({ ok: true, ...result }, { status: 201, headers: { "cache-control": "no-store" } });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "catalog_operation_failed";
    if (["json_required", "invalid_json", "invalid_product", "product_name_required", "product_name_invalid", "price_invalid", "cost_invalid", "stock_invalid", "low_stock_threshold_invalid", "compare_at_price_invalid", "badge_invalid"].includes(message)) return jsonError(message, 400);
    return jsonError(message, 409);
  }
  return jsonError("not_found", 404);
}

async function handleAdminLoyalty(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return jsonError("database_unavailable", 503);
  if (!(await requireAdmin(env, request))) return jsonError("admin_auth_required", 401);
  const path = new URL(request.url).pathname.replace(/^\/admin\/loyalty\/?/, "");
  try {
    if (path === "configuration" && request.method === "GET") return Response.json(await getLoyaltyConfiguration(env.DB), { headers: { "cache-control": "no-store" } });
    if (path === "configuration" && request.method === "PATCH") {
      const body = await parseJson(request);
      const config: LoyaltyConfiguration = {
        pointsPerMinor: body.pointsPerMinor as number,
        tierThresholds: { member: 0, silver: (body.tierThresholds as Record<string, unknown> | undefined)?.silver as number, gold: (body.tierThresholds as Record<string, unknown> | undefined)?.gold as number, platinum: (body.tierThresholds as Record<string, unknown> | undefined)?.platinum as number },
        pointsPerCreditMinor: body.pointsPerCreditMinor as number,
        referralMinimumOrderMinor: body.referralMinimumOrderMinor as number,
        referrerPoints: body.referrerPoints as number,
        referredPoints: body.referredPoints as number,
      };
      return Response.json(await updateLoyaltyConfiguration(env.DB, config), { headers: { "cache-control": "no-store" } });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "loyalty_configuration_failed";
    if (["json_required", "invalid_json", "points_per_minor_invalid", "points_per_credit_minor_invalid", "member_threshold_invalid", "silver_threshold_invalid", "gold_threshold_invalid", "platinum_threshold_invalid", "tier_threshold_order_invalid", "referral_minimum_order_minor_invalid", "referrer_points_invalid", "referred_points_invalid", "loyalty_configuration_update_failed"].includes(message)) return jsonError(message, 400);
    return jsonError(message, 409);
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
    // checkout implementation continues below
    return jsonError("not_implemented", 501);
  } catch (error) {
    const message = error instanceof Error ? error.message : "checkout_failed";
    return jsonError(message, 400);
  }
}

const coreWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return Response.json({ ok: true, service: "prime-core-service", env: env.APP_ENV });
    if (!env.DB) return jsonError("database_unavailable", 503);
    if (url.pathname.startsWith("/admin/delivery/")) return handleAdminDelivery(request, env);
    if (url.pathname.startsWith("/admin/catalog/")) return handleAdminCatalog(request, env);
    if (url.pathname.startsWith("/admin/loyalty/")) return handleAdminLoyalty(request, env);
    if (url.pathname.startsWith("/admin/orders/") && url.pathname.endsWith("/payment-confirm")) return handleAdminPaymentSettlement(request, env);
    if (url.pathname === "/customer/auth/exchange") {
      if (!env.TELEGRAM_BOT_TOKEN) return jsonError("telegram_auth_not_configured", 503);
      return handleTelegramCustomerExchange(request, env);
    }
    if (url.pathname === "/admin/auth/login") return handleAdminLogin(request, env);
    if (url.pathname === "/admin/auth/session") return requireAdmin(env, request).then((ok) => ok ? Response.json({ ok: true }, { headers: { "cache-control": "no-store" } }) : jsonError("admin_auth_required", 401));
    if (url.pathname === "/admin/auth/logout") {
      const headers = new Headers({ "cache-control": "no-store" });
      headers.append("set-cookie", `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return new Response(null, { status: 204, headers });
    }
    if (url.pathname === "/customer/catalog/products" && request.method === "GET") return handleCustomerCatalog(request, env);
    if (url.pathname === "/customer/catalog/couriers" && request.method === "GET") return handleCustomerCouriers(request, env);
    if (url.pathname === "/customer/checkout/quote" && request.method === "POST") return handleCustomerCheckout(request, env);
    if (url.pathname === "/customer/checkout/submit" && request.method === "POST") return submitCheckout(request, env);
    return jsonError("not_found", 404);
  },
};

export default coreWorker;
