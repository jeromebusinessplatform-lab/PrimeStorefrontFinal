import { transitionOrder, type OrderWorkflowState } from "./order-workflow";
import { getLoyaltyConfiguration } from "../loyalty/loyalty-config-store";
import { applyLoyaltyForPaidOrder } from "../commerce/commerce-workflow";

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}
interface D1Db {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<{ success: boolean }[]>;
}

export interface PaymentSettlementInput {
  orderId: string;
  actorId?: string;
  now?: Date;
}

export async function settlePayment(
  db: D1Db,
  input: PaymentSettlementInput,
): Promise<{ orderId: string; state: "PAYMENT_CLEARED"; awardedPoints: number }> {
  const now = input.now ?? new Date();
  const order = await db
    .prepare("SELECT id, customer_id, workflow_state, subtotal_minor, delivery_fee_minor, discount_minor, store_credit_minor, currency FROM orders WHERE id = ? LIMIT 1")
    .bind(input.orderId)
    .first<{
      id: string;
      customer_id: string;
      workflow_state: OrderWorkflowState;
      subtotal_minor: number;
      delivery_fee_minor: number;
      discount_minor: number;
      store_credit_minor: number;
      currency: string;
    }>();

  if (!order) throw new Error("order_not_found");
  if (order.workflow_state === "PAYMENT_CLEARED") {
    return { orderId: order.id, state: "PAYMENT_CLEARED", awardedPoints: 0 };
  }
  if (!["REVIEW", "AWAITING_RECEIPT_RESUBMISSION", "HOLD_ORDER"].includes(order.workflow_state)) {
    throw new Error("payment_confirmation_invalid_state");
  }

  const next = transitionOrder({ state: order.workflow_state, action: "PAYMENT_CONFIRMED" });
  if (next !== "PAYMENT_CLEARED") throw new Error("payment_confirmation_failed");

  const existing = await db
    .prepare("SELECT id FROM loyalty_transactions WHERE customer_id = ? AND reference_type = 'order_payment' AND reference_id = ? AND kind = 'earn' LIMIT 1")
    .bind(order.customer_id, order.id)
    .first<{ id: string }>();

  const config = await getLoyaltyConfiguration(db);
  const quote = {
    subtotalMinor: order.subtotal_minor,
    deliveryFeeMinor: order.delivery_fee_minor,
    discountMinor: order.discount_minor,
    storeCreditMinor: order.store_credit_minor,
    totalMinor: order.subtotal_minor - order.discount_minor - order.store_credit_minor + order.delivery_fee_minor,
    currency: order.currency,
  };
  const accountRow = await db
    .prepare("SELECT points_balance, lifetime_points, store_credit_minor, tier FROM loyalty_accounts WHERE customer_id = ? LIMIT 1")
    .bind(order.customer_id)
    .first<{
      points_balance: number;
      lifetime_points: number;
      store_credit_minor: number;
      tier: "member" | "silver" | "gold" | "platinum";
    }>();
  const account = accountRow ?? {
    points_balance: 0,
    lifetime_points: 0,
    store_credit_minor: 0,
    tier: "member" as const,
  };
  const loyalty = applyLoyaltyForPaidOrder(
    {
      pointsBalance: account.points_balance,
      lifetimePoints: account.lifetime_points,
      storeCreditMinor: account.store_credit_minor,
      tier: account.tier,
    },
    quote,
    {
      pointsPerMinor: config.pointsPerMinor,
      tierThresholds: config.tierThresholds,
      pointsPerCreditMinor: config.pointsPerCreditMinor,
    },
  );

  const statements: D1Statement[] = [
    db
      .prepare("UPDATE orders SET workflow_state = 'PAYMENT_CLEARED', updated_at = ? WHERE id = ? AND workflow_state IN ('REVIEW','AWAITING_RECEIPT_RESUBMISSION','HOLD_ORDER')")
      .bind(now.toISOString(), order.id),
    db
      .prepare("INSERT INTO order_workflow_events (id, order_id, action, from_state, to_state, actor_type, actor_id, occurred_at, payload_redacted) VALUES (?, ?, 'PAYMENT_CONFIRMED', ?, 'PAYMENT_CLEARED', 'admin', ?, ?, ?)")
      .bind(
        crypto.randomUUID(),
        order.id,
        order.workflow_state,
        input.actorId ?? null,
        now.toISOString(),
        JSON.stringify({ awardedPoints: existing ? 0 : loyalty.earnedPoints }),
      ),
  ];

  if (!existing) {
    statements.push(
      db
        .prepare("INSERT INTO loyalty_transactions (id, customer_id, kind, points_delta, credit_delta_minor, reference_type, reference_id, created_at) VALUES (?, ?, 'earn', ?, 0, 'order_payment', ?, ?)")
        .bind(crypto.randomUUID(), order.customer_id, loyalty.earnedPoints, order.id, now.toISOString()),
      db
        .prepare("INSERT INTO loyalty_accounts (customer_id, points_balance, lifetime_points, store_credit_minor, tier, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(customer_id) DO UPDATE SET points_balance = loyalty_accounts.points_balance + excluded.points_balance, lifetime_points = loyalty_accounts.lifetime_points + excluded.lifetime_points, tier = CASE WHEN loyalty_accounts.lifetime_points + excluded.lifetime_points >= ? THEN 'platinum' WHEN loyalty_accounts.lifetime_points + excluded.lifetime_points >= ? THEN 'gold' WHEN loyalty_accounts.lifetime_points + excluded.lifetime_points >= ? THEN 'silver' ELSE 'member' END, updated_at = excluded.updated_at")
        .bind(
          order.customer_id,
          loyalty.earnedPoints,
          loyalty.earnedPoints,
          0,
          account.tier,
          now.toISOString(),
          config.tierThresholds.platinum,
          config.tierThresholds.gold,
          config.tierThresholds.silver,
        ),
    );
  }

  try {
    const results = await db.batch(statements);
    if (results.some((result) => !result.success)) throw new Error("payment_settlement_failed");
  } catch (error) {
    const settled = await db
      .prepare("SELECT id FROM loyalty_transactions WHERE customer_id = ? AND reference_type = 'order_payment' AND reference_id = ? AND kind = 'earn' LIMIT 1")
      .bind(order.customer_id, order.id)
      .first<{ id: string }>();
    if (settled) return { orderId: order.id, state: "PAYMENT_CLEARED", awardedPoints: 0 };
    throw error;
  }

  return {
    orderId: order.id,
    state: "PAYMENT_CLEARED",
    awardedPoints: existing ? 0 : loyalty.earnedPoints,
  };
}
