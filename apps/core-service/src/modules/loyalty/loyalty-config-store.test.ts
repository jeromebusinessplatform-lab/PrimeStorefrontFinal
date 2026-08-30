import { describe, expect, it } from "vitest";

function validateThresholdOrder(member: number, silver: number, gold: number, platinum: number): void {
  if (!(member <= silver && silver <= gold && gold <= platinum)) throw new Error("tier_threshold_order_invalid");
}

describe("loyalty configuration", () => {
  it("requires ascending tier thresholds", () => {
    expect(() => validateThresholdOrder(0, 1000, 5000, 10000)).not.toThrow();
    expect(() => validateThresholdOrder(0, 5000, 1000, 10000)).toThrow("tier_threshold_order_invalid");
  });
});
