import { validateCustomerSession } from "../identity/customer-session";

interface CustomerOrderRow {
  id: string;
  order_number: string | null;
  workflow_state: string | null;
  status: string | null;
  total_minor: number;
  currency: string | null;
  created_at: string;
  updated_at: string;
  receiver_name: string | null;
  receiver_contact: string | null;
  delivery_address_text: string | null;
  delivery_formatted_address: string | null;
  delivery_provider: string | null;
  delivery_fee_minor: number | null;
  delivery_fee_payment_method: string | null;
  tracking_link: string | null;
}

interface OrderEventRow {
  id: string;
  action: string;
  from_state: string | null;
  to_state: string | null;
  actor_type: string;
  occurred_at: string;
  tracking_link: string | null;
}

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "private, no-store" } });
}

function serializeOrder(row: CustomerOrderRow) {
  const workflowState = row.workflow_state ?? row.status ?? "REVIEW";
  const canTrack = workflowState === "DISPATCHED" && Boolean(row.tracking_link);
  return {
    id: row.id,
    orderNumber: row.order_number ?? row.id.slice(0, 8),
    workflowState,
    status: row.status ?? workflowState,
    totalMinor: Number(row.total_minor ?? 0),
    currency: row.currency ?? "PHP",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    receiver: {
      name: row.receiver_name,
      phone: row.receiver_contact,
      address: row.delivery_formatted_address ?? row.delivery_address_text,
    },
    delivery: {
      provider: row.delivery_provider,
      feeMinor: Number(row.delivery_fee_minor ?? 0),
      paymentMethod: row.delivery_fee_payment_method,
    },
    tracking: canTrack ? { enabled: true, url: row.tracking_link } : { enabled: false, url: null },
  };
}

export async function handleCustomerOrders(request: Request, db: D1Database): Promise<Response> {
  if (request.method !== "GET") return errorResponse("method_not_allowed", 405);
  const session = await validateCustomerSession(db, request);
  if (!session) return errorResponse("telegram_session_required", 401);

  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  try {
    if (!orderId) {
      const result = await db.prepare("SELECT id, order_number, workflow_state, status, total_minor, currency, created_at, updated_at, receiver_name, receiver_contact, delivery_address_text, delivery_formatted_address, delivery_provider, delivery_fee_minor, delivery_fee_payment_method, tracking_link FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50").bind(session.customer_id).all<CustomerOrderRow>();
      return Response.json({ orders: result.results.map(serializeOrder) }, { headers: { "cache-control": "private, no-store" } });
    }

    const row = await db.prepare("SELECT id, order_number, workflow_state, status, total_minor, currency, created_at, updated_at, receiver_name, receiver_contact, delivery_address_text, delivery_formatted_address, delivery_provider, delivery_fee_minor, delivery_fee_payment_method, tracking_link FROM orders WHERE id = ? AND customer_id = ? LIMIT 1").bind(orderId, session.customer_id).first<CustomerOrderRow>();
    if (!row) return errorResponse("order_not_found", 404);

    const events = await db.prepare("SELECT id, action, from_state, to_state, actor_type, occurred_at, tracking_link FROM order_workflow_events WHERE order_id = ? ORDER BY occurred_at ASC").bind(orderId).all<OrderEventRow>();
    return Response.json({ order: serializeOrder(row), timeline: events.results.map((event) => ({ id: event.id, action: event.action, fromState: event.from_state, toState: event.to_state, actorType: event.actor_type, occurredAt: event.occurred_at, trackingLink: event.tracking_link })) }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return errorResponse("orders_unavailable", 503);
  }
}

export async function handleCustomerOrderTracking(request: Request, db: D1Database): Promise<Response> {
  if (request.method !== "GET") return errorResponse("method_not_allowed", 405);
  const session = await validateCustomerSession(db, request);
  if (!session) return errorResponse("telegram_session_required", 401);
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) return errorResponse("order_id_required", 400);

  try {
    const row = await db.prepare("SELECT id, order_number, workflow_state, status, tracking_link, updated_at FROM orders WHERE id = ? AND customer_id = ? LIMIT 1").bind(orderId, session.customer_id).first<{ id: string; order_number: string | null; workflow_state: string | null; status: string | null; tracking_link: string | null; updated_at: string }>();
    if (!row) return errorResponse("order_not_found", 404);
    const workflowState = row.workflow_state ?? row.status ?? "REVIEW";
    const enabled = workflowState === "DISPATCHED" && Boolean(row.tracking_link);
    return Response.json({ orderId: row.id, orderNumber: row.order_number ?? row.id.slice(0, 8), workflowState, track: enabled ? { enabled: true, url: row.tracking_link } : { enabled: false, url: null }, updatedAt: row.updated_at }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return errorResponse("tracking_unavailable", 503);
  }
}
