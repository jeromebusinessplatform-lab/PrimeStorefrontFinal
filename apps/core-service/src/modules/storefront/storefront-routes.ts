import { validateCustomerSession } from "../identity/customer-session";
import { listProducts } from "../catalog/catalog-store";
import { listCouriers } from "../delivery/delivery-config-store";

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "private, no-store" } });
}

export async function handleCustomerCatalog(request: Request, db: D1Database): Promise<Response> {
  if (request.method !== "GET") return errorResponse("method_not_allowed", 405);
  if (!(await validateCustomerSession(db, request))) return errorResponse("telegram_session_required", 401);
  try {
    return Response.json({ products: await listProducts(db) }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return errorResponse("catalog_unavailable", 503);
  }
}

export async function handleCustomerCouriers(request: Request, db: D1Database): Promise<Response> {
  if (request.method !== "GET") return errorResponse("method_not_allowed", 405);
  if (!(await validateCustomerSession(db, request))) return errorResponse("telegram_session_required", 401);
  try {
    return Response.json({ couriers: await listCouriers(db) }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return errorResponse("couriers_unavailable", 503);
  }
}
