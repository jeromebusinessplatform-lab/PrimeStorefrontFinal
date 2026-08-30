import { describe, expect, it, vi } from "vitest";
import { getDynamicOrderActions } from "./admin-payment-settlement";

describe("admin order management action contract", () => {
  it("matches the approved state-driven button behavior", () => {
    const expected = {
      REVIEW: ["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "REJECT_ORDER"],
      PAYMENT_CLEARED: ["START_PACKING"],
      PACKING: ["READY"],
      READY: ["AWAITING_RIDER"],
      AWAITING_RIDER: ["DISPATCH"],
      DISPATCHED: ["DELIVER"],
      DELIVERED: [],
      PAYMENT_FAILED: ["HOLD_ORDER", "REQUEST_RESUBMIT", "REJECT_ORDER"],
      HOLD_ORDER: ["PAYMENT_CLEARED", "REJECT_ORDER"],
      AWAITING_RECEIPT_RESUBMISSION: ["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "REJECT_ORDER"],
    } as const;
    for (const [state, actions] of Object.entries(expected)) expect(getDynamicOrderActions(state as never)).toEqual(actions);
  });
});
