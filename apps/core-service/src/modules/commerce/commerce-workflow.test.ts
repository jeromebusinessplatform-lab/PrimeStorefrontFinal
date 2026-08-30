import { describe, expect, it } from "vitest";
import { applyCommerceOrderAction, applyLoyaltyForPaidOrder, buildCommerceQuote } from "./commerce-workflow";
import { calculateCoupon } from "../promotions/promotion-engine";
import { qualifyReferral, rewardReferral } from "../referrals/referral-engine";
import { normalizeTrackingUrl } from "../tracking/tracking";

describe("Sprint 3 commerce workflow", () => {
  it("builds a server-authoritative quote from delivery, coupon, and store credit", () => {
    const quote = buildCommerceQuote({
      state: "REVIEW",
      subtotalMinor: 10000,
      deliveryFeeMinor: 250,
      currency: "php",
      storeCreditMinor: 500,
      couponRule: { code: "SAVE10", discountType: "percent", discountValue: 10, usageCount: 0, active: true },
    });
    expect(quote).toEqual({ subtotalMinor: 10000, deliveryFeeMinor: 250, discountMinor: 1000, storeCreditMinor: 500, totalMinor: 8750, currency: "PHP" });
  });

  it("requires HTTPS tracking before dispatch", () => {
    expect(() => applyCommerceOrderAction("AWAITING_RIDER", "DISPATCH", "http://example.com/track")).toThrow("tracking_link_must_be_https");
    expect(applyCommerceOrderAction("AWAITING_RIDER", "DISPATCH", normalizeTrackingUrl("https://example.com/track/1"))).toBe("DISPATCHED");
  });

  it("qualifies and rewards a referral only after the minimum order", () => {
    const referral = { id: "r1", referrerCustomerId: "c1", referredCustomerId: "c2", code: "REF-1234", status: "pending" as const };
    const qualified = qualifyReferral({ referral, orderTotalMinor: 5000 }, { minimumOrderMinor: 5000, referrerPoints: 100, referredPoints: 50 });
    expect(qualified.status).toBe("qualified");
    expect(rewardReferral(qualified).status).toBe("rewarded");
  });

  it("calculates fixed and percent coupons in integer minor units", () => {
    expect(calculateCoupon({ code: "FIXED", discountType: "fixed", discountValue: 250, usageCount: 0, active: true }, { subtotalMinor: 1000 }).discountMinor).toBe(250);
    expect(calculateCoupon({ code: "PCT10", discountType: "percent", discountValue: 10, usageCount: 0, active: true }, { subtotalMinor: 999 }).discountMinor).toBe(99);
  });

  it("earns loyalty points from the final paid order total", () => {
    const result = applyLoyaltyForPaidOrder(
      { pointsBalance: 0, lifetimePoints: 900, storeCreditMinor: 0, tier: "member" },
      { subtotalMinor: 1000, deliveryFeeMinor: 0, discountMinor: 0, storeCreditMinor: 0, totalMinor: 1000, currency: "PHP" },
      { pointsPerMinor: 1, pointsPerCreditMinor: 100, tierThresholds: { member: 0, silver: 500, gold: 1000, platinum: 5000 } },
    );
    expect(result.earnedPoints).toBe(1000);
    expect(result.account.pointsBalance).toBe(1000);
    expect(result.account.lifetimePoints).toBe(1900);
    expect(result.account.tier).toBe("gold");
  });
});
