export const ORDER_WORKFLOW_STATES = [
  "REVIEW",
  "PAYMENT_CLEARED",
  "PACKING",
  "READY",
  "AWAITING_RIDER",
  "DISPATCHED",
  "DELIVERED",
  "PAYMENT_FAILED",
  "HOLD_ORDER",
  "AWAITING_RECEIPT_RESUBMISSION",
  "REJECTED",
  "CANCELLED",
] as const;

export type OrderWorkflowState = typeof ORDER_WORKFLOW_STATES[number];

export type OrderAction =
  | "PAYMENT_CONFIRMED"
  | "START_PACKING"
  | "READY"
  | "AWAITING_RIDER"
  | "DISPATCH"
  | "DELIVER"
  | "PAYMENT_FAILED"
  | "HOLD_ORDER"
  | "REQUEST_RESUBMIT"
  | "PAYMENT_CLEARED"
  | "REJECT_ORDER"
  | "MODIFY"
  | "CANCEL_ORDER";

export interface TransitionRequest {
  state: OrderWorkflowState;
  action: OrderAction;
  trackingLink?: string;
}

export class InvalidOrderTransition extends Error {
  constructor(code: string) {
    super(code);
    this.name = "InvalidOrderTransition";
  }
}

const transitions: Record<OrderWorkflowState, Partial<Record<OrderAction, OrderWorkflowState>>> = {
  REVIEW: { PAYMENT_CONFIRMED: "PAYMENT_CLEARED", PAYMENT_FAILED: "PAYMENT_FAILED", MODIFY: "REVIEW", CANCEL_ORDER: "CANCELLED" },
  PAYMENT_CLEARED: { START_PACKING: "PACKING", MODIFY: "PAYMENT_CLEARED", CANCEL_ORDER: "CANCELLED" },
  PACKING: { READY: "READY", MODIFY: "PACKING", CANCEL_ORDER: "CANCELLED" },
  READY: { AWAITING_RIDER: "AWAITING_RIDER", CANCEL_ORDER: "CANCELLED" },
  AWAITING_RIDER: { DISPATCH: "DISPATCHED" },
  DISPATCHED: { DELIVER: "DELIVERED" },
  DELIVERED: {},
  PAYMENT_FAILED: { HOLD_ORDER: "HOLD_ORDER", REQUEST_RESUBMIT: "AWAITING_RECEIPT_RESUBMISSION", REJECT_ORDER: "REJECTED", MODIFY: "PAYMENT_FAILED", CANCEL_ORDER: "CANCELLED" },
  HOLD_ORDER: { PAYMENT_CLEARED: "PAYMENT_CLEARED", REJECT_ORDER: "REJECTED", CANCEL_ORDER: "CANCELLED" },
  AWAITING_RECEIPT_RESUBMISSION: { PAYMENT_CONFIRMED: "PAYMENT_CLEARED", PAYMENT_FAILED: "PAYMENT_FAILED", REJECT_ORDER: "REJECTED", CANCEL_ORDER: "CANCELLED" },
  REJECTED: {},
  CANCELLED: {},
};

export function canCustomerModify(state: OrderWorkflowState): boolean {
  return !["READY", "AWAITING_RIDER", "DISPATCHED", "DELIVERED", "REJECTED", "CANCELLED"].includes(state);
}

export function canCustomerCancel(state: OrderWorkflowState): boolean {
  return !["AWAITING_RIDER", "DISPATCHED", "DELIVERED", "REJECTED", "CANCELLED"].includes(state);
}

export function transitionOrder(request: TransitionRequest): OrderWorkflowState {
  if (request.action === "MODIFY" && !canCustomerModify(request.state)) throw new InvalidOrderTransition("customer_modification_locked");
  if (request.action === "CANCEL_ORDER" && !canCustomerCancel(request.state)) throw new InvalidOrderTransition("customer_cancellation_locked");
  if (request.action === "DISPATCH") {
    if (request.state !== "AWAITING_RIDER") throw new InvalidOrderTransition("dispatch_requires_awaiting_rider");
    if (!request.trackingLink?.trim()) throw new InvalidOrderTransition("tracking_link_required_for_dispatch");
    normalizeTrackingLink(request.trackingLink);
    return "DISPATCHED";
  }
  const next = transitions[request.state][request.action];
  if (!next) throw new InvalidOrderTransition(`invalid_transition:${request.state}:${request.action}`);
  return next;
}

export function normalizeTrackingLink(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new InvalidOrderTransition("tracking_link_invalid"); }
  if (url.protocol !== "https:") throw new InvalidOrderTransition("tracking_link_must_be_https");
  return url.toString();
}

export function customerTrackingAction(trackingLink: string | null | undefined): "TRACK" | null {
  return trackingLink ? "TRACK" : null;
}
