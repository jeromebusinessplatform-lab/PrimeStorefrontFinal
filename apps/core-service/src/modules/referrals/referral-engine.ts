export type ReferralStatus = "pending" | "qualified" | "rewarded" | "void";

export interface Referral {
  id: string;
  referrerCustomerId: string;
  referredCustomerId: string;
  code: string;
  status: ReferralStatus;
}

export interface ReferralPolicy {
  minimumOrderMinor: number;
  referrerPoints: number;
  referredPoints: number;
}

export interface ReferralQualification {
  referral: Referral;
  orderTotalMinor: number;
}

export class InvalidReferral extends Error {
  constructor(code: string) {
    super(code);
    this.name = "InvalidReferral";
  }
}

export function normalizeReferralCode(value: string): string {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{3,31}$/.test(code)) throw new InvalidReferral("referral_code_invalid");
  return code;
}

export function createReferralCode(prefix: string, randomPart: string): string {
  const code = `${prefix.trim().toUpperCase()}-${randomPart.trim().toUpperCase()}`;
  return normalizeReferralCode(code);
}

export function qualifyReferral(input: ReferralQualification, policy: ReferralPolicy): Referral {
  if (input.referral.status !== "pending") throw new InvalidReferral("referral_not_pending");
  if (input.referral.referrerCustomerId === input.referral.referredCustomerId) throw new InvalidReferral("self_referral_forbidden");
  if (!Number.isSafeInteger(input.orderTotalMinor) || input.orderTotalMinor < policy.minimumOrderMinor) throw new InvalidReferral("referral_minimum_not_met");
  if (!Number.isSafeInteger(policy.minimumOrderMinor) || policy.minimumOrderMinor < 0) throw new InvalidReferral("referral_policy_invalid");
  if (!Number.isSafeInteger(policy.referrerPoints) || policy.referrerPoints < 0 || !Number.isSafeInteger(policy.referredPoints) || policy.referredPoints < 0) throw new InvalidReferral("referral_reward_invalid");
  return Object.freeze({ ...input.referral, status: "qualified" });
}

export function rewardReferral(referral: Referral): Referral {
  if (referral.status !== "qualified") throw new InvalidReferral("referral_not_qualified");
  return Object.freeze({ ...referral, status: "rewarded" });
}
