import { describe, expect, it } from "vitest";
import { calculateDeliveryFee } from "./delivery-fee";

describe("delivery fee", () => {
  it("calculates the normal fee with the minimum floor", () => {
    expect(calculateDeliveryFee(1, 10, "normal").feePhp).toBe(80);
  });

  it("uses the supplied normal, same-day and express rates", () => {
    expect(calculateDeliveryFee(10, 20, "normal").feePhp).toBe(200);
    expect(calculateDeliveryFee(10, 20, "sameday").feePhp).toBe(270);
    expect(calculateDeliveryFee(10, 20, "express").feePhp).toBe(350);
  });

  it("adds the express rush surcharge above the 30 minute threshold", () => {
    expect(calculateDeliveryFee(10, 31, "express").rushSurchargePhp).toBe(40);
    expect(calculateDeliveryFee(10, 31, "express").feePhp).toBe(390);
  });

  it("rounds the server-calculated distance and duration", () => {
    const quote = calculateDeliveryFee(22.234, 36.789, "normal");
    expect(quote.distanceKm).toBe(22.23);
    expect(quote.durationMinutes).toBe(36.79);
  });
});
