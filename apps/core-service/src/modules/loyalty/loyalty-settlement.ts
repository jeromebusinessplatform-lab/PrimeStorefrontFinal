import { pointsEarned, tierForLifetimePoints, type LoyaltyPolicy, type LoyaltyTier } from "./loyalty-engine";

export interface LoyaltySettlementAccount {
  pointsBalance: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
}

export interface LoyaltySettlementInput {
  orderTotalMinor: number;
  account: LoyaltySettlementAccount;
  policy: LoyaltyPolicy;
}

export interface LoyaltySettlementResult {
  earnedPoints: number;
  pointsBalance: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
}

export function settlePaidOrderLoyalty(input: LoyaltySettlementInput): LoyaltySettlementResult {
  const earnedPoints = pointsEarned(input.orderTotalMinor, input.policy);
  const lifetimePoints = input.account.lifetimePoints + earnedPoints;
  const pointsBalance = input.account.pointsBalance + earnedPoints;
  if (!Number.isSafeInteger(lifetimePoints) || !Number.isSafeInteger(pointsBalance)) throw new Error("points_overflow");
  const tier = tierForLifetimePoints(lifetimePoints, input.policy.tierThresholds);
  return Object.freeze({ earnedPoints, pointsBalance, lifetimePoints, tier });
}
