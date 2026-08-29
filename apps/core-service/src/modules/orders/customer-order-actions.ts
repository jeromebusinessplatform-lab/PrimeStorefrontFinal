import { canCustomerCancel, canCustomerModify, type OrderWorkflowState } from "./order-workflow";

export interface CustomerOrderActions {
  canModify: boolean;
  canCancel: boolean;
  trackUrl: string | null;
}

export function getCustomerOrderActions(
  state: OrderWorkflowState,
  trackingLink: string | null | undefined,
): CustomerOrderActions {
  return {
    canModify: canCustomerModify(state),
    canCancel: canCustomerCancel(state),
    trackUrl: trackingLink ?? null,
  };
}
