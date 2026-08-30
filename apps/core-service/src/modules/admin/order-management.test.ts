import { describe, expect, it } from "vitest";
import { getDynamicOrderActions } from "./admin-payment-settlement";

describe("dynamic Admin order actions", () => {
  it("returns only actions valid for each workflow state", () => {
    expect(getDynamicOrderActions("REVIEW")).toEqual(["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "REJECT_ORDER"]);
    expect(getDynamicOrderActions("PAYMENT_CLEARED")).toEqual(["START_PACKING"]);
    expect(getDynamicOrderActions("PACKING")).toEqual(["READY"]);
    expect(getDynamicOrderActions("READY")).toEqual(["AWAITING_RIDER"]);
    expect(getDynamicOrderActions("AWAITING_RIDER")).toEqual(["DISPATCH"]);
    expect(getDynamicOrderActions("DISPATCHED")).toEqual(["DELIVER"]);
    expect(getDynamicOrderActions("DELIVERED")).toEqual([]);
  });

  it("supports failure and recovery action paths", () => {
    expect(getDynamicOrderActions("PAYMENT_FAILED")).toEqual(["HOLD_ORDER", "REQUEST_RESUBMIT", "REJECT_ORDER"]);
    expect(getDynamicOrderActions("HOLD_ORDER")).toEqual(["PAYMENT_CLEARED", "REJECT_ORDER"]);
    expect(getDynamicOrderActions("AWAITING_RECEIPT_RESUBMISSION")).toEqual(["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "REJECT_ORDER"]);
  });
});
