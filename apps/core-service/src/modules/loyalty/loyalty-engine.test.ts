import { describe, expect, it } from "vitest";
import { storeCreditFromPoints } from "./loyalty-engine";

describe("store credit ledger rules", () => {
  it("converts eligible points to whole minor-unit store credit", () => {
    expect(storeCreditFromPoints(249, { pointsPerMinor: 1, pointsPerCreditMinor: 100, tierThresholds: { member: 0, silver: 500, gold: 5000, platinum: 10000 } })).toBe(2);
  });

  it("rejects invalid credit conversion policy", () => {
    expect(() => storeCreditFromPoints(100, { pointsPerMinor: 1, pointsPerCreditMinor: 0, tierThresholds: { member: 0, silver: 500, gold: 5000, platinum: 10000 } })).toThrow("credit_policy_invalid");
  });
});
