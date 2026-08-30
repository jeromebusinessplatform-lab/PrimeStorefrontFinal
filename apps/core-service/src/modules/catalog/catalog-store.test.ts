import { describe, expect, it } from "vitest";
import { productMarginMinor } from "./catalog-store";

describe("catalog rules", () => {
  it("calculates signed margin from selling price and cost", () => {
    expect(productMarginMinor(15000, 9000)).toBe(6000);
    expect(productMarginMinor(9000, 11000)).toBe(-2000);
  });

  it("rejects unsafe or negative money inputs", () => {
    expect(() => productMarginMinor(-1, 0)).toThrow("price_invalid");
    expect(() => productMarginMinor(Number.MAX_SAFE_INTEGER + 1, 0)).toThrow("price_invalid");
  });
});
