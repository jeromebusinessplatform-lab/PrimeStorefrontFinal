import { describe, expect, it } from "vitest";
import { evaluateProductBadges } from "./badge-engine";

describe("product badges", () => {
  it("derives sale, bestseller, low stock and new badges", () => {
    expect(evaluateProductBadges({
      isNew: true,
      compareAtPriceMinor: 20000,
      priceMinor: 15000,
      unitsSold: 50,
      bestSellerThreshold: 25,
      stockAvailable: 3,
      lowStockThreshold: 5,
      active: true,
    })).toEqual(["NEW", "SALE", "BEST_SELLER", "LOW_STOCK"]);
  });

  it("marks inactive or empty products unavailable", () => {
    expect(evaluateProductBadges({
      isNew: false,
      priceMinor: 100,
      unitsSold: 0,
      bestSellerThreshold: 10,
      stockAvailable: 0,
      lowStockThreshold: 2,
      active: true,
    })).toEqual(["UNAVAILABLE"]);
  });
});
