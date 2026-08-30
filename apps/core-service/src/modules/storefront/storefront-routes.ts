import { validateCustomerSession } from "../identity/customer-session";
import { listProducts } from "../catalog/catalog-store";
import { listCouriers } from "../delivery/delivery-config-store";
import { autocompleteAddress } from "../integrations/geoapify-autocomplete";

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "private, no-store" } });
}

export async function handleCustomerCatalog(request: Request, db: D1Database): Promise<Response> {
  if (request.method !== "GET") return errorResponse("method_not_allowed", 405);
  const session = await validateCustomerSession(db, request);
  if (!session) return errorResponse("telegram_session_required", 401);
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "orders") return listCustomerOrders(db, session.customer_id);
  if (url.searchParams.get("view") === "autocomplete") {
    const query = (url.searchParams.get("q") ?? "").trim();
    const apiKey = url.searchParams.get("apiKey") ?? "";
    if (query.length < 3) return Response.json({ suggestions: [] }, { headers: { "cache-control": "private, no-store" } });
    if (!apiKey) return errorResponse("geoapify_not_configured", 503);
    try {
      const suggestions = await autocompleteAddress(query, apiKey, { countryCode: "ph", limit: 8 });
      return Response.json({ suggestions }, { headers: { "cache-control": "private, no-store" } });
    } catch {
      return errorResponse("address_autocomplete_failed", 502);
    }
  }
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

async function listCustomerOrders(db: D1Database, customerId: string): Promise<Response> {
  const result = await db.prepare(`SELECT id, order_number, workflow_state, status, total_minor, currency, created_at, tracking_link, dispatched_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 25`).bind(customerId).all<Record<string, unknown>>();
  return Response.json({ orders: result.results.map((row) => ({
    id: String(row.id),
    orderNumber: row.order_number ? String(row.order_number) : String(row.id).slice(0, 8),
    workflowState: row.workflow_state ? String(row.workflow_state) : String(row.status ?? "REVIEW"),
    status: String(row.status ?? "REVIEW"),
    totalMinor: Number(row.total_minor ?? 0),
    currency: String(row.currency ?? "PHP"),
    createdAt: String(row.created_at ?? ""),
    trackingLink: row.tracking_link ? String(row.tracking_link) : null,
    dispatchedAt: row.dispatched_at ? String(row.dispatched_at) : null,
  })) }, { headers: { "cache-control": "private, no-store" } });
}
