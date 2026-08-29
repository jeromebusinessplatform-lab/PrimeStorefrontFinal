import { describe, expect, it } from "vitest";
import {
  InvalidOrderTransition,
  canCustomerCancel,
  canCustomerModify,
  customerTrackingAction,
  normalizeTrackingLink,
  transitionOrder,
} from "./order-workflow";

describe("order workflow overrides", () => {
  it("locks customer modification at READY", () => {
    expect(canCustomerModify("PACKING")).toBe(true);
    expect(canCustomerModify("READY")).toBe(false);
    expect(() => transitionOrder({ state: "READY", action: "MODIFY" })).toThrowError("customer_modification_locked");
  });

  it("locks customer cancellation at AWAITING_RIDER", () => {
    expect(canCustomerCancel("READY")).toBe(true);
    expect(canCustomerCancel("AWAITING_RIDER")).toBe(false);
    expect(() => transitionOrder({ state: "AWAITING_RIDER", action: "CANCEL_ORDER" })).toThrowError("customer_cancellation_locked");
  });

  it("requires an HTTPS tracking link before dispatch", () => {
    expect(() => transitionOrder({ state: "AWAITING_RIDER", action: "DISPATCH" })).toThrowError("tracking_link_required_for_dispatch");
    expect(() => transitionOrder({ state: "AWAITING_RIDER", action: "DISPATCH", trackingLink: "http://example.com/track/1" })).toThrowError("tracking_link_must_be_https");
    expect(transitionOrder({ state: "AWAITING_RIDER", action: "DISPATCH", trackingLink: "https://example.com/track/1" })).toBe("DISPATCHED");
  });

  it("only exposes TRACK when a tracking link exists", () => {
    expect(customerTrackingAction(null)).toBeNull();
    expect(customerTrackingAction(undefined)).toBeNull();
    expect(customerTrackingAction("https://example.com/track/1")).toBe("TRACK");
  });

  it("normalizes valid tracking links", () => {
    expect(normalizeTrackingLink("  https://example.com/track/1  ")).toBe("https://example.com/track/1");
  });

  it("rejects non-https tracking links", () => {
    expect(() => normalizeTrackingLink("javascript:alert(1)")).toThrowError(InvalidOrderTransition);
  });
});
