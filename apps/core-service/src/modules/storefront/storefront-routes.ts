import { validateCustomerSession } from "../identity/customer-session";
import { listProducts } from "../catalog/catalog-store";
import { listCouriers } from "../delivery/delivery-config-store";

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "private, no-store" } });
}

export async function handleCustomerCatalog(request: Request, db: D1Database): Promise<Response> {
  if (request.method !== "GET") return errorResponse("method_not_allowed", 405);
  const session = await validateCustomerSession(db, request);
  if (!session) return errorResponse("telegram_session_required", 401);
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "orders") return listCustomerOrders(db, session.customer_id);
  if (url.searchParams.get("view") === "order") return getCustomerOrder(db, session.customer_id, url.searchParams.get("orderId"));
  if (url.searchParams.get("view") === "tracking") return getCustomerTracking(db, session.customer_id, url.searchParams.get("orderId"));
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
  const result = await db.prepare("SELECT id, order_number, workflow_state, status, total_minor, currency, created_at, updated_at, receiver_name, receiver_contact, delivery_address_text, delivery_formatted_address, delivery_provider, delivery_fee_minor, delivery_fee_payment_method, tracking_link FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50").bind(customerId).all<Record<string, unknown>>();
  return Response.json({ orders: result.results.map(serializeCustomerOrder) }, { headers: { "cache-control": "private, no-store" } });
}

async function getCustomerOrder(db: D1Database, customerId: string, orderId: string | null): Promise<Response> {
  if (!orderId) return errorResponse("order_id_required", 400);
  const row = await db.prepare("SELECT id, order_number, workflow_state, status, total_minor, currency, created_at, updated_at, receiver_name, receiver_contact, delivery_address_text, delivery_formatted_address, delivery_provider, delivery_fee_minor, delivery_fee_payment_method, tracking_link FROM orders WHERE id = ? AND customer_id = ? LIMIT 1").bind(orderId, customerId).first<Record<string, unknown>>();
  if (!row) return errorResponse("order_not_found", 404);
  const events = await db.prepare("SELECT id, action, from_state, to_state, actor_type, actor_id, occurred_at, tracking_link FROM order_workflow_events WHERE order_id = ? ORDER BY occurred_at ASC").bind(orderId).all<Record<string, unknown>>();
  return Response.json({ order: serializeCustomerOrder(row), timeline: events.results.map((event) => ({ id: String(event.id), action: String(event.action), fromState: event.from_state ? String(event.from_state) : null, toState: event.to_state ? String(event.to_state) : null, actorType: String(event.actor_type), actorId: event.actor_id ? String(event.actor_id) : null, occurredAt: String(event.occurred_at), trackingLink: event.tracking_link ? String(event.tracking_link) : null })) }, { headers: { "cache-control": "private, no-store" } });
}

async function getCustomerTracking(db: D1Database, customerId: string, orderId: string | null): Promise<Response> {
  if (!orderId) return errorResponse("order_id_required", 400);
  const row = await db.prepare("SELECT id, order_number, workflow_state, status, tracking_link, updated_at FROM orders WHERE id = ? AND customer_id = ? LIMIT 1").bind(orderId, customerId).first<Record<string, unknown>>();
  if (!row) return errorResponse("order_not_found", 404);
  const state = String(row.workflow_state ?? row.status ?? "REVIEW");
  const enabled = state === "DISPATCHED" && typeof row.tracking_link === "string" && row.tracking_link.trim().length > 0;
  return Response.json({ orderId: String(row.id), orderNumber: row.order_number ? String(row.order_number) : String(row.id).slice(0, 8), workflowState: state, track: { enabled, url: enabled ? String(row.tracking_link) : null }, updatedAt: String(row.updated_at ?? "") }, { headers: { "cache-control": "private, no-store" } });
}

function serializeCustomerOrder(row: Record<string, unknown>) {
  const state = String(row.workflow_state ?? row.status ?? "REVIEW");
  const trackingEnabled = state === "DISPATCHED" && Boolean(row.tracking_link);
  return {
    id: String(row.id),
    orderNumber: row.order_number ? String(row.order_number) : String(row.id).slice(0, 8),
    workflowState: state,
    status: String(row.status ?? state),
    totalMinor: Number(row.total_minor ?? 0),
    currency: String(row.currency ?? "PHP"),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    receiver: {
      name: row.receiver_name ? String(row.receiver_name) : null,
      phone: row.receiver_contact ? String(row.receiver_contact) : null,
      address: row.delivery_formatted_address ? String(row.delivery_formatted_address) : row.delivery_address_text ? String(row.delivery_address_text) : null,
    },
    delivery: {
      provider: row.delivery_provider ? String(row.delivery_provider) : null,
      feeMinor: Number(row.delivery_fee_minor ?? 0),
      paymentMethod: row.delivery_fee_payment_method ? String(row.delivery_fee_payment_method) : null,
    },
    tracking: { enabled: trackingEnabled, url: trackingEnabled ? String(row.tracking_link) : null },
  };
}
