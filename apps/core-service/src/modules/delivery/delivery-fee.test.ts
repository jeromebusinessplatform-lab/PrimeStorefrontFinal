import { describe, expect, it } from "vitest";
import { calculateConfiguredDeliveryFee } from "./delivery-fee";

const standard = {
  baseFeeMinor: 5_000,
  perKmRateMinor: 1_500,
  platformFeeMinor: 500,
  surchargeMinor: 0,
};

describe("configured delivery fee", () => {
  it("calculates base + distance + platform fee in minor units", () => {
    const quote = calculateConfiguredDeliveryFee(10, 20, "standard", standard);
    expect(quote.distanceFeeMinor).toBe(15_000);
    expect(quote.feeMinor).toBe(20_500);
  });

  it("uses the configured courier pricing instead of a hard-coded schedule", () => {
    const quote = calculateConfiguredDeliveryFee(10, 20, "express", {
      baseFeeMinor: 7_500,
      perKmRateMinor: 2_200,
      platformFeeMinor: 300,
      surchargeMinor: 1_000,
    });
    expect(quote.feeMinor).toBe(30_800);
  });

  it("rounds distance only for presentation while calculating against server precision", () => {
    const quote = calculateConfiguredDeliveryFee(22.234, 36.789, "priority", standard);
    expect(quote.distanceKm).toBe(22.23);
    expect(quote.durationMinutes).toBe(36.79);
    expect(quote.distanceFeeMinor).toBe(Math.round(22.234 * 1_500));
  });

  it("accepts zero surcharge and zero-distance routes without inventing a minimum fee", () => {
    const quote = calculateConfiguredDeliveryFee(0, 0, "standard", {
      baseFeeMinor: 2_000,
      perKmRateMinor: 1_000,
      platformFeeMinor: 0,
      surchargeMinor: 0,
    });
    expect(quote.feeMinor).toBe(2_000);
  });
});
