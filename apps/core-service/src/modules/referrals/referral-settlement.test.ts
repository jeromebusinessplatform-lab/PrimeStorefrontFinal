import { describe, expect, it } from "vitest";
import { qualifyReferral, rewardReferral } from "./referral-engine";

describe("referral settlement rules", () => {
  it("requires the configured minimum order before reward", () => {
    const pending = { id: "r1", referrerCustomerId: "c1", referredCustomerId: "c2", code: "PRIME-CODE", status: "pending" as const };
    expect(() => qualifyReferral({ referral: pending, orderTotalMinor: 99 }, { minimumOrderMinor: 100, referrerPoints: 50, referredPoints: 25 })).toThrow("referral_minimum_not_met");
    const qualified = qualifyReferral({ referral: pending, orderTotalMinor: 100 }, { minimumOrderMinor: 100, referrerPoints: 50, referredPoints: 25 });
    expect(rewardReferral(qualified).status).toBe("rewarded");
  });
});
