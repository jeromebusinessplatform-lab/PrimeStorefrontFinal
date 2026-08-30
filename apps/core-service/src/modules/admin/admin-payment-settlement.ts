import { settlePayment } from "../orders/order-payment-settlement";
import { transitionOrder, type OrderAction, type OrderWorkflowState } from "../orders/order-workflow";
import { validateAdminSession } from "../security/admin-session";

interface PaymentSettlementEnv { DB?: D1Database; }
interface OrderRow { id: string; workflow_state: OrderWorkflowState; status: string | null; tracking_link: string | null; }

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

const dynamicActions: Partial<Record<OrderWorkflowState, OrderAction[]>> = {
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

export function getDynamicOrderActions(state: OrderWorkflowState): OrderAction[] {
  return dynamicActions[state] ?? [];
}

function isAllowedAction(state: OrderWorkflowState, action: OrderAction): boolean {
  return getDynamicOrderActions(state).includes(action);
}

export async function handleAdminPaymentSettlement(request: Request, env: PaymentSettlementEnv): Promise<Response> {
  if (!env.DB) return errorResponse("database_unavailable", 503);
  const session = await validateAdminSession(env.DB, request);
  if (!session) return errorResponse("admin_auth_required", 401);
  const match = new URL(request.url).pathname.match(/^\/admin\/orders\/([^/]+)\/payment-confirm$/);
  if (!match) return errorResponse("not_found", 404);
  if (request.method !== "POST") return errorResponse("method_not_allowed", 405);

  const orderId = decodeURIComponent(match[1]);
  try {
    let action: OrderAction = "PAYMENT_CONFIRMED";
    let trackingLink: string | undefined;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.toLowerCase().includes("application/json")) {
      const body = await request.json() as Record<string, unknown>;
      if (typeof body.action === "string") action = body.action as OrderAction;
      if (typeof body.trackingLink === "string") trackingLink = body.trackingLink;
    }

    const row = await env.DB.prepare("SELECT id, workflow_state, status, tracking_link FROM orders WHERE id = ? LIMIT 1").bind(orderId).first<OrderRow>();
    if (!row) return errorResponse("order_not_found", 404);
    if (!isAllowedAction(row.workflow_state, action)) return errorResponse("action_not_available", 409);

    if (action === "PAYMENT_CONFIRMED" || action === "PAYMENT_CLEARED") {
      const result = await settlePayment(env.DB, { orderId, actorId: session.id });
      return Response.json({ ok: true, action, ...result }, { headers: { "cache-control": "no-store" } });
    }

    const nextState = transitionOrder({ state: row.workflow_state, action, trackingLink });
    const nextStatus = nextState.toLowerCase();
    const normalizedTracking = action === "DISPATCH" && trackingLink ? new URL(trackingLink.trim()).toString() : row.tracking_link;
    const result = await env.DB.prepare("UPDATE orders SET workflow_state = ?, status = ?, tracking_link = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND workflow_state = ?").bind(nextState, nextStatus, normalizedTracking ?? null, orderId, row.workflow_state).run();
    if (!result.success || (result.meta?.changes ?? 0) !== 1) return errorResponse("payment_confirmation_failed", 409);
    await env.DB.prepare("INSERT INTO order_workflow_events (id, order_id, action, from_state, to_state, actor_type, actor_id, tracking_link, occurred_at, payload_redacted) VALUES (?, ?, ?, ?, ?, 'admin', ?, ?, CURRENT_TIMESTAMP, ?)").bind(crypto.randomUUID(), orderId, action, row.workflow_state, nextState, session.id, normalizedTracking ?? null, JSON.stringify({})).run();
    return Response.json({ ok: true, orderId, action, workflowState: nextState, trackingLink: normalizedTracking ?? null, availableActions: getDynamicOrderActions(nextState) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "payment_settlement_failed";
    if (message === "json_required") return errorResponse(message, 415);
    if (["order_not_found"].includes(message)) return errorResponse(message, 404);
    if (["payment_confirmation_invalid_state", "payment_confirmation_failed", "action_not_available", "tracking_link_required_for_dispatch"].includes(message)) return errorResponse(message, 409);
    if (["tracking_link_invalid", "tracking_link_must_be_https"].includes(message)) return errorResponse(message, 400);
    if (message === "payment_settlement_total_invalid") return errorResponse(message, 400);
    return errorResponse(message, 500);
  }
}
