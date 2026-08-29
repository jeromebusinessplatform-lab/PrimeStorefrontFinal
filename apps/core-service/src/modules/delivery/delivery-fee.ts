export type DeliverySpeed = "standard" | "express" | "priority";

export interface DeliveryPricingConfig {
  baseFeeMinor: number;
  perKmRateMinor: number;
  platformFeeMinor?: number;
  surchargeMinor?: number;
}

export interface DeliveryFeeQuote {
  distanceKm: number;
  durationMinutes: number;
  speed: DeliverySpeed;
  baseFeeMinor: number;
  distanceFeeMinor: number;
  platformFeeMinor: number;
  surchargeMinor: number;
  feeMinor: number;
  currency: "PHP";
}

function assertMoney(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`invalid_${field}`);
}

/** Server-authoritative delivery fee calculation from the persisted courier configuration. */
export function calculateConfiguredDeliveryFee(
  distanceKm: number,
  durationMinutes: number,
  speed: DeliverySpeed,
  config: DeliveryPricingConfig,
): DeliveryFeeQuote {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new Error("invalid_route_distance");
  if (!Number.isFinite(durationMinutes) || durationMinutes < 0) throw new Error("invalid_route_duration");
  assertMoney(config.baseFeeMinor, "base_fee");
  assertMoney(config.perKmRateMinor, "per_km_rate");
  assertMoney(config.platformFeeMinor ?? 0, "platform_fee");
  assertMoney(config.surchargeMinor ?? 0, "surcharge");

  const baseFeeMinor = config.baseFeeMinor;
  const distanceFeeMinor = Math.round(distanceKm * config.perKmRateMinor);
  const platformFeeMinor = config.platformFeeMinor ?? 0;
  const surchargeMinor = config.surchargeMinor ?? 0;
  const feeMinor = baseFeeMinor + distanceFeeMinor + platformFeeMinor + surchargeMinor;

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationMinutes: Math.round(durationMinutes * 100) / 100,
    speed,
    baseFeeMinor,
    distanceFeeMinor,
    platformFeeMinor,
    surchargeMinor,
    feeMinor,
    currency: "PHP",
  };
}
