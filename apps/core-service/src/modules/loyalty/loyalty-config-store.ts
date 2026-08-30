interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = unknown>(): Promise<T | null>;
}
interface D1Like { prepare(sql: string): D1PreparedStatementLike; }

export interface LoyaltyConfiguration {
  pointsPerMinor: number;
  tierThresholds: { member: number; silver: number; gold: number; platinum: number };
  pointsPerCreditMinor: number;
  referralMinimumOrderMinor: number;
  referrerPoints: number;
  referredPoints: number;
}

function nonNegativeSafeInt(value: unknown, field: string): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${field}_invalid`);
}

function assertConfiguration(config: LoyaltyConfiguration): void {
  nonNegativeSafeInt(config.pointsPerMinor, "points_per_minor");
  nonNegativeSafeInt(config.pointsPerCreditMinor, "points_per_credit_minor");
  if (config.pointsPerCreditMinor <= 0) throw new Error("points_per_credit_minor_invalid");
  nonNegativeSafeInt(config.tierThresholds.member, "member_threshold");
  nonNegativeSafeInt(config.tierThresholds.silver, "silver_threshold");
  nonNegativeSafeInt(config.tierThresholds.gold, "gold_threshold");
  nonNegativeSafeInt(config.tierThresholds.platinum, "platinum_threshold");
  if (!(config.tierThresholds.member <= config.tierThresholds.silver && config.tierThresholds.silver <= config.tierThresholds.gold && config.tierThresholds.gold <= config.tierThresholds.platinum)) throw new Error("tier_threshold_order_invalid");
  nonNegativeSafeInt(config.referralMinimumOrderMinor, "referral_minimum_order_minor");
  nonNegativeSafeInt(config.referrerPoints, "referrer_points");
  nonNegativeSafeInt(config.referredPoints, "referred_points");
}

export async function getLoyaltyConfiguration(db: D1Like): Promise<LoyaltyConfiguration> {
  const row = await db.prepare(`SELECT points_per_minor, tier_silver_threshold, tier_gold_threshold, tier_platinum_threshold,
      points_per_credit_minor, referral_minimum_order_minor, referrer_points, referred_points
    FROM loyalty_configuration WHERE id = 1 LIMIT 1`).first<Record<string, number>>();
  if (!row) throw new Error("loyalty_configuration_missing");
  return {
    pointsPerMinor: Number(row.points_per_minor),
    tierThresholds: { member: 0, silver: Number(row.tier_silver_threshold), gold: Number(row.tier_gold_threshold), platinum: Number(row.tier_platinum_threshold) },
    pointsPerCreditMinor: Number(row.points_per_credit_minor),
    referralMinimumOrderMinor: Number(row.referral_minimum_order_minor),
    referrerPoints: Number(row.referrer_points),
    referredPoints: Number(row.referred_points),
  };
}

export async function updateLoyaltyConfiguration(db: D1Like, config: LoyaltyConfiguration, now = new Date()): Promise<LoyaltyConfiguration> {
  assertConfiguration(config);
  await db.prepare(`UPDATE loyalty_configuration SET points_per_minor = ?, tier_silver_threshold = ?, tier_gold_threshold = ?, tier_platinum_threshold = ?, points_per_credit_minor = ?, referral_minimum_order_minor = ?, referrer_points = ?, referred_points = ?, updated_at = ? WHERE id = 1`)
    .bind(config.pointsPerMinor, config.tierThresholds.silver, config.tierThresholds.gold, config.tierThresholds.platinum, config.pointsPerCreditMinor, config.referralMinimumOrderMinor, config.referrerPoints, config.referredPoints, now.toISOString()).first();
  return config;
}
