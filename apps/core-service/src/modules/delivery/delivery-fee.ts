export const DELIVERY_FEE_CONFIG = Object.freeze({
  BASE_FEE_PHP: 50,
  NORMAL_RATE_PER_KM_PHP: 15,
  SAMEDAY_RATE_PER_KM_PHP: 22,
  EXPRESS_RATE_PER_KM_PHP: 30,
  EXPRESS_RUSH_SURCHARGE_PHP: 40,
  RUSH_THRESHOLD_MINUTES: 30,
  MIN_FEE_PHP: 80,
});

export type DeliverySpeed = "normal" | "sameday" | "express";

export interface DeliveryFeeQuote {
  distanceKm: number;
  durationMinutes: number;
  speed: DeliverySpeed;
  rushSurchargePhp: number;
  feePhp: number;
  currency: "PHP";
}

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateDeliveryFee(
  distanceKm: number,
  durationMinutes: number,
  speed: DeliverySpeed,
): DeliveryFeeQuote {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) throw new Error("invalid_route_distance");
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error("invalid_route_duration");

  const rate = speed === "normal"
    ? DELIVERY_FEE_CONFIG.NORMAL_RATE_PER_KM_PHP
    : speed === "sameday"
      ? DELIVERY_FEE_CONFIG.SAMEDAY_RATE_PER_KM_PHP
      : DELIVERY_FEE_CONFIG.EXPRESS_RATE_PER_KM_PHP;

  const rushSurchargePhp = speed === "express" && durationMinutes > DELIVERY_FEE_CONFIG.RUSH_THRESHOLD_MINUTES
    ? DELIVERY_FEE_CONFIG.EXPRESS_RUSH_SURCHARGE_PHP
    : 0;

  const raw = DELIVERY_FEE_CONFIG.BASE_FEE_PHP + rate * distanceKm + rushSurchargePhp;
  return {
    distanceKm: money(distanceKm),
    durationMinutes: money(durationMinutes),
    speed,
    rushSurchargePhp,
    feePhp: money(Math.max(raw, DELIVERY_FEE_CONFIG.MIN_FEE_PHP)),
    currency: "PHP",
  };
}
