import type { ReferralPolicy } from "./referral-engine";

export interface ReferralSettlementInput {
  referralId: string;
  orderId: string;
  referredCustomerId: string;
  orderTotalMinor: number;
  policy: ReferralPolicy;
  now: Date;
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}
interface D1Db { prepare(sql: string): D1Statement; batch(statements: D1Statement[]): Promise<{ success: boolean }[]>; }

/** Settles a qualifying referral exactly once after a paid order clears. */
export async function settleReferral(db: D1Db, input: ReferralSettlementInput): Promise<{ rewarded: boolean; referralId: string }> {
  if (!Number.isSafeInteger(input.orderTotalMinor) || input.orderTotalMinor < input.policy.minimumOrderMinor) {
    return { rewarded: false, referralId: input.referralId };
  }
  const referral = await db.prepare("SELECT id, referrer_customer_id, referred_customer_id, status FROM referrals WHERE id = ? AND referred_customer_id = ? LIMIT 1")
    .bind(input.referralId, input.referredCustomerId)
    .first<{ id: string; referrer_customer_id: string; referred_customer_id: string; status: "pending" | "qualified" | "rewarded" | "void" }>();
  if (!referral || referral.status === "void" || referral.status === "rewarded") return { rewarded: false, referralId: input.referralId };
  if (referral.referred_customer_id === referral.referrer_customer_id) throw new Error("self_referral_forbidden");

  const results = await db.batch([
    db.prepare("UPDATE referrals SET status = 'rewarded', qualified_at = COALESCE(qualified_at, ?), rewarded_at = ? WHERE id = ? AND status IN ('pending','qualified')").bind(input.now.toISOString(), input.now.toISOString(), referral.id),
    db.prepare("INSERT INTO loyalty_transactions (id, customer_id, kind, points_delta, credit_delta_minor, reference_type, reference_id, created_at) VALUES (?, ?, 'referral', ?, 0, 'referral', ?, ?)").bind(crypto.randomUUID(), referral.referrer_customer_id, input.policy.referrerPoints, referral.id, input.now.toISOString()),
    db.prepare("INSERT INTO loyalty_transactions (id, customer_id, kind, points_delta, credit_delta_minor, reference_type, reference_id, created_at) VALUES (?, ?, 'referral', ?, 0, 'referral', ?, ?)").bind(crypto.randomUUID(), referral.referred_customer_id, input.policy.referredPoints, referral.id, input.now.toISOString()),
  ]);
  if (results.some((result) => !result.success)) throw new Error("referral_settlement_failed");
  return { rewarded: true, referralId: referral.id };
}
