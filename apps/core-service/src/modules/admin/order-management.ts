import { transitionOrder, type OrderAction, type OrderWorkflowState } from "../orders/order-workflow";
import { validateAdminSession } from "../security/admin-session";

interface OrderRow {
  id: string;
  workflow_state: OrderWorkflowState;
  status: string | null;
  tracking_link: string | null;
}

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

const actionLabels: Record<OrderAction, string> = {
  PAYMENT_CONFIRMED: "Payment Confirmed",
  START_PACKING: "Start Packing",
  READY: "Ready",
  AWAITING_RIDER: "Awaiting Rider",
  DISPATCH: "Dispatch",
  DELIVER: "Delivered",
  PAYMENT_FAILED: "Payment Failed",
  HOLD_ORDER: "Hold Order",
  REQUEST_RESUBMIT: "Request Resubmit",
  PAYMENT_CLEARED: "Payment Cleared",
  REJECT_ORDER: "Reject Order",
  MODIFY: "Modify",
  CANCEL_ORDER: "Cancel Order",
};

export function getAdminOrderActions(state: OrderWorkflowState): Array<{ action: OrderAction; label: string; destructive: boolean; requiresTrackingLink: boolean }> {
  const actions: Partial<Record<OrderWorkflowState, OrderAction[]>> = {
    REVIEW: ["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "REJECT_ORDER"],
    PAYMENT_CLEARED: ["START_PACKING"],
    PACKING: ["READY"],
    READY: ["AWAITING_RIDER"],
    AWAITING_RIDER: ["DISPATCH"],
    DISPATCHED: ["DELIVER"],
    PAYMENT_FAILED: ["HOLD_ORDER", "REQUEST_RESUBMIT", "REJECT_ORDER"],
    HOLD_ORDER: ["PAYMENT_CLEARED", "REJECT_ORDER"],
    AWAITING_RECEIPT_RESUBMISSION: ["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "REJECT_ORDER"],
  };
  return (actions[state] ?? []).map((action) => ({
    action,
    label: actionLabels[action],
    destructive: ["PAYMENT_FAILED", "REJECT_ORDER"].includes(action),
    requiresTrackingLink: action === "DISPATCH",
  }));
}

export async function handleAdminOrderManagement(request: Request, env: { DB?: D1Database }): Promise<Response> {
  if (!env.DB) return errorResponse("database_unavailable", 503);
  const session = await validateAdminSession(env.DB, request);
  if (!session) return errorResponse("admin_auth_required", 401);

  const match = new URL(request.url).pathname.match(/^\/admin\/orders\/([^/]+)(?:\/actions)?$/);
  if (!match) return errorResponse("not_found", 404);
  const orderId = decodeURIComponent(match[1]);

  try {
    if (request.method === "GET") {
      const row = await env.DB.prepare("SELECT id, workflow_state, status, tracking_link FROM orders WHERE id = ? LIMIT 1").bind(orderId).first<OrderRow>();
      if (!row) return errorResponse("order_not_found", 404);
      return Response.json({ orderId: row.id, workflowState: row.workflow_state, actions: getAdminOrderActions(row.workflow_state), trackingLink: row.tracking_link }, { headers: { "cache-control": "no-store" } });
    }

    if (request.method !== "POST") return errorResponse("method_not_allowed", 405);
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) return errorResponse("json_required", 415);
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.action !== "string") return errorResponse("action_required", 400);
    const action = body.action as OrderAction;
    const trackingLink = typeof body.trackingLink === "string" ? body.trackingLink : undefined;

    const row = await env.DB.prepare("SELECT id, workflow_state, status, tracking_link FROM orders WHERE id = ? LIMIT 1").bind(orderId).first<OrderRow>();
    if (!row) return errorResponse("order_not_found", 404);
    const allowed = getAdminOrderActions(row.workflow_state).some((item) => item.action === action);
    if (!allowed) return errorResponse("action_not_available", 409);

    const nextState = transitionOrder({ state: row.workflow_state, action, trackingLink });
    if (action === "DISPATCH") {
      await env.DB.prepare("UPDATE orders SET workflow_state = ?, status = ?, tracking_link = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND workflow_state = ?").bind(nextState, nextState.toLowerCase(), new URL(trackingLink as string).toString(), orderId, row.workflow_state).run();
    } else {
      await env.DB.prepare("UPDATE orders SET workflow_state = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND workflow_state = ?").bind(nextState, nextState.toLowerCase(), orderId, row.workflow_state).run();
    }
    await env.DB.prepare("INSERT INTO order_workflow_events (id, order_id, action, from_state, to_state, actor_type, actor_id, tracking_link, occurred_at, payload_redacted) VALUES (?, ?, ?, ?, ?, 'admin', ?, ?, CURRENT_TIMESTAMP, ?)").bind(crypto.randomUUID(), orderId, action, row.workflow_state, nextState, session.id, trackingLink ?? null, JSON.stringify({})).run();
    return Response.json({ ok: true, orderId, workflowState: nextState, trackingLink: action === "DISPATCH" ? new URL(trackingLink as string).toString() : row.tracking_link }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "order_action_failed";
    if (["tracking_link_required_for_dispatch", "tracking_link_invalid", "tracking_link_must_be_https", "customer_modification_locked", "customer_cancellation_locked"].includes(message)) return errorResponse(message, 400);
    if (message.startsWith("invalid_transition:") || message === "dispatch_requires_awaiting_rider") return errorResponse(message, 409);
    return errorResponse(message, 500);
  }
}
