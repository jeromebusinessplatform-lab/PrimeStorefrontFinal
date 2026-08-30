import { describe, expect, it } from "vitest";
import { settlePaidOrderLoyalty } from "./loyalty-settlement";

describe("paid-order loyalty settlement", () => {
  it("awards points and recomputes tier after payment clears", () => {
    const result = settlePaidOrderLoyalty({
      orderTotalMinor: 650,
      account: { pointsBalance: 400, lifetimePoints: 400, tier: "member" },
      policy: {
        pointsPerMinor: 1,
        tierThresholds: { member: 0, silver: 500, gold: 5000, platinum: 10000 },
        pointsPerCreditMinor: 100,
      },
    });
    expect(result.earnedPoints).toBe(650);
    expect(result.pointsBalance).toBe(1050);
    expect(result.lifetimePoints).toBe(1050);
    expect(result.tier).toBe("silver");
  });
});
