import { describe, expect, it } from "vitest";
import { settlePayment } from "./order-payment-settlement";

class FakeStatement {
  readonly sql: string;
  readonly values: unknown[];
  constructor(private readonly db: FakeD1Db, sql: string) {
    this.sql = sql;
    this.values = [];
  }

  bind(...values: unknown[]): FakeStatement {
    this.values.push(...values);
    return this;
  }

  async first<T = unknown>(): Promise<T | null> {
    const sql = this.sql;
    if (sql.startsWith("SELECT id, customer_id, workflow_state")) {
      return this.db.order as T;
    }
    if (sql.startsWith("SELECT points_per_minor")) {
      return this.db.loyaltyConfiguration as T;
    }
    if (sql.startsWith("SELECT points_balance, lifetime_points")) {
      return (this.db.loyaltyAccount ? { ...this.db.loyaltyAccount } : null) as T;
    }
    if (sql.startsWith("SELECT id FROM loyalty_transactions") && sql.includes("reference_type = 'order_payment'")) {
      return this.db.earnedOrderIds.has(this.db.order.id) ? ({ id: "earned-order" } as T) : null;
    }
    if (sql.startsWith("SELECT id, referrer_customer_id, referred_customer_id")) {
      return (this.db.referral ? { ...this.db.referral } : null) as T;
    }
    return null;
  }

  async run(): Promise<{ success: boolean; meta?: { changes?: number } }> {
    return { success: true, meta: { changes: 1 } };
  }
}

class FakeD1Db {
  order = {
    id: "order-1",
    customer_id: "customer-2",
    workflow_state: "REVIEW" as const,
    subtotal_minor: 1000,
    delivery_fee_minor: 100,
    discount_minor: 100,
    store_credit_minor: 0,
    currency: "PHP",
  };
  loyaltyConfiguration = {
    points_per_minor: 1,
    tier_silver_threshold: 500,
    tier_gold_threshold: 1000,
    tier_platinum_threshold: 5000,
    points_per_credit_minor: 100,
    referral_minimum_order_minor: 500,
    referrer_points: 100,
    referred_points: 50,
  };
  loyaltyAccount = {
    points_balance: 400,
    lifetime_points: 400,
    store_credit_minor: 0,
    tier: "member" as const,
  };
  referral = {
    id: "referral-1",
    referrer_customer_id: "customer-1",
    referred_customer_id: "customer-2",
  };
  earnedOrderIds = new Set<string>();
  referralRewardKeys = new Set<string>();
  appliedReferralRewards = 0;
  appliedPoints = 0;

  prepare(sql: string): FakeStatement {
    return new FakeStatement(this, sql);
  }

  async batch(statements: FakeStatement[]): Promise<{ success: boolean }[]> {
    let changes = 1;
    return statements.map((statement) => {
      const sql = statement.sql;
      if (sql.startsWith("UPDATE orders SET workflow_state = 'PAYMENT_CLEARED'")) {
        if (this.order.workflow_state === "REVIEW") {
          this.order.workflow_state = "PAYMENT_CLEARED";
          changes = 1;
        } else {
          changes = 0;
        }
      } else if (sql.startsWith("INSERT INTO order_workflow_events")) {
        changes = changes;
      } else if (sql.startsWith("INSERT OR IGNORE INTO loyalty_transactions") && sql.includes("'earn'")) {
        if (changes === 1) {
          this.earnedOrderIds.add(this.order.id);
          this.appliedPoints += Number(statement.values[2] ?? 0);
          changes = 1;
        } else {
          changes = 0;
        }
      } else if (sql.startsWith("INSERT INTO loyalty_accounts")) {
        if (changes === 1) {
          this.loyaltyAccount.points_balance += Number(statement.values[1] ?? 0);
          this.loyaltyAccount.lifetime_points += Number(statement.values[2] ?? 0);
        }
      } else if (sql.startsWith("UPDATE referrals SET status = 'rewarded'")) {
        this.referral = this.referral ? { ...this.referral } : null;
        if (this.referral) changes = 1;
      } else if (sql.startsWith("INSERT OR IGNORE INTO loyalty_transactions") && sql.includes("'referral'")) {
        if (changes === 1) {
          const key = `${statement.values[1]}:${statement.values[3]}`;
          if (!this.referralRewardKeys.has(key)) {
            this.referralRewardKeys.add(key);
            this.appliedReferralRewards += Number(statement.values[2] ?? 0);
          }
        }
      } else if (sql.startsWith("INSERT INTO loyalty_accounts") && sql.includes("SELECT")) {
        changes = 1;
      }
      return { success: true };
    });
  }
}

describe("payment settlement integration", () => {
  it("clears the order, awards loyalty, and records referral rewards exactly once", async () => {
    const db = new FakeD1Db();

    const first = await settlePayment(db, { orderId: "order-1", actorId: "admin-session-1", now: new Date("2026-08-30T15:00:00Z") });
    const second = await settlePayment(db, { orderId: "order-1", actorId: "admin-session-1", now: new Date("2026-08-30T15:01:00Z") });

    expect(first.state).toBe("PAYMENT_CLEARED");
    expect(first.awardedPoints).toBe(1000);
    expect(second.awardedPoints).toBe(0);
    expect(db.order.workflow_state).toBe("PAYMENT_CLEARED");
    expect(db.earnedOrderIds.size).toBe(1);
    expect(db.appliedPoints).toBe(1000);
  });
});
