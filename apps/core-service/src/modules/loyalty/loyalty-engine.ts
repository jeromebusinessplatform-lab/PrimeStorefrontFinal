export const LOYALTY_TIERS = ["member", "silver", "gold", "platinum"] as const;
export type LoyaltyTier = (typeof LOYALTY_TIERS)[number];

export interface LoyaltyAccount {
  pointsBalance: number;
  lifetimePoints: number;
  storeCreditMinor: number;
  tier: LoyaltyTier;
}

export interface LoyaltyPolicy {
  pointsPerMinor: number;
  tierThresholds: Record<LoyaltyTier, number>;
  pointsPerCreditMinor: number;
}

export class InvalidLoyaltyOperation extends Error {
  constructor(code: string) {
    super(code);
    this.name = "InvalidLoyaltyOperation";
  }
}

function nonNegativeSafe(value: number): boolean { return Number.isSafeInteger(value) && value >= 0; }

export function pointsEarned(orderTotalMinor: number, policy: LoyaltyPolicy): number {
  if (!nonNegativeSafe(orderTotalMinor) || !Number.isSafeInteger(policy.pointsPerMinor) || policy.pointsPerMinor < 0) throw new InvalidLoyaltyOperation("loyalty_policy_invalid");
  return orderTotalMinor * policy.pointsPerMinor;
}

export function tierForLifetimePoints(points: number, thresholds: Record<LoyaltyTier, number>): LoyaltyTier {
  if (!nonNegativeSafe(points)) throw new InvalidLoyaltyOperation("points_invalid");
  for (const tier of [...LOYALTY_TIERS].reverse()) if (points >= thresholds[tier]) return tier;
  return "member";
}

export function earnPoints(account: LoyaltyAccount, points: number, policy: LoyaltyPolicy): LoyaltyAccount {
  if (!nonNegativeSafe(points)) throw new InvalidLoyaltyOperation("points_invalid");
  const lifetimePoints = account.lifetimePoints + points;
  const balance = account.pointsBalance + points;
  if (!nonNegativeSafe(lifetimePoints) || !nonNegativeSafe(balance)) throw new InvalidLoyaltyOperation("points_overflow");
  return Object.freeze({ ...account, pointsBalance: balance, lifetimePoints, tier: tierForLifetimePoints(lifetimePoints, policy.tierThresholds) });
}

export function redeemPoints(account: LoyaltyAccount, points: number): LoyaltyAccount {
  if (!nonNegativeSafe(points) || points > account.pointsBalance) throw new InvalidLoyaltyOperation("insufficient_points");
  return Object.freeze({ ...account, pointsBalance: account.pointsBalance - points });
}

export function storeCreditFromPoints(points: number, policy: LoyaltyPolicy): number {
  if (!nonNegativeSafe(points) || !nonNegativeSafe(policy.pointsPerCreditMinor) || policy.pointsPerCreditMinor <= 0) throw new InvalidLoyaltyOperation("credit_policy_invalid");
  return Math.floor(points / policy.pointsPerCreditMinor);
}
