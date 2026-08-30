import { assertReceiverDetails, CHECKOUT_PAYMENT_METHODS, type CheckoutPaymentMethod } from "./checkout-flow";
import { calculateCoupon, normalizeCouponCode } from "../promotions/promotion-engine";
import { generateOrderNumber } from "../orders/order-number";

interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}

interface D1ResultLike {
  success: boolean;
}

interface D1Like {
  prepare(sql: string): D1PreparedStatementLike;
  batch(statements: D1PreparedStatementLike[]): Promise<D1ResultLike[]>;
}

interface CheckoutRow {
  id: string;
  customer_id: string;
  status: string;
  receiver_name: string | null;
  receiver_contact: string | null;
  delivery_address_text: string | null;
  delivery_formatted_address: string | null;
  delivery_lat: number | null;
  delivery_lon: number | null;
  delivery_provider: string | null;
  delivery_fee_amount: number | null;
  delivery_fee_currency: string | null;
  delivery_fee_payment_method: string | null;
  delivery_quote_version: number | null;
  delivery_quote_expires_at: string | null;
  expires_at: string;
}

interface CartItemRow {
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price_minor: number;
  name: string;
}

interface CouponRow {
  id: string;
  code: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  min_subtotal_minor: number;
  max_discount_minor: number | null;
  usage_limit: number | null;
  usage_count: number;
  active: number;
  starts_at: string | null;
  ends_at: string | null;
}

interface ReferralReferrerRow {
  id: string;
  prime_member_id: string;
}

interface ReferralExistingRow {
  id: string;
  status: string;
}

interface ReceiptRow {
  id: string;
}

export interface CheckoutSubmissionInput {
  checkoutSessionId: string;
  customerId: string;
  couponCode?: string;
  referralCode?: string;
  redeemStoreCreditMinor?: number;
  now?: Date;
}

export interface CheckoutSubmissionResult {
  orderId: string;
  orderNumber: string;
  workflowState: "REVIEW";
  subtotalMinor: number;
  deliveryFeeMinor: number;
  discountMinor: number;
  storeCreditMinor: number;
  totalMinor: number;
  currency: string;
  paymentMethod: CheckoutPaymentMethod;
}

function safeNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function requireCurrentQuote(row: CheckoutRow, now: Date): void {
  if (!row.delivery_quote_expires_at) return;
  if (new Date(row.delivery_quote_expires_at).getTime() <= now.getTime()) throw new Error("delivery_quote_expired");
}

export async function submitCheckout(db: D1Like, input: CheckoutSubmissionInput): Promise<CheckoutSubmissionResult> {
  const now = input.now ?? new Date();
  if (!input.checkoutSessionId.trim()) throw new Error("checkout_session_required");
  if (!input.customerId.trim()) throw new Error("customer_required");

  const checkout = await db.prepare(
    "SELECT id, customer_id, status, receiver_name, receiver_contact, delivery_address_text, delivery_formatted_address, delivery_lat, delivery_lon, delivery_provider, delivery_fee_amount, delivery_fee_currency, delivery_fee_payment_method, delivery_quote_version, delivery_quote_expires_at, expires_at FROM checkout_sessions WHERE id = ? AND customer_id = ? LIMIT 1",
  ).bind(input.checkoutSessionId, input.customerId).first<CheckoutRow>();
  if (!checkout) throw new Error("checkout_not_found");
  if (checkout.status === "submitted") throw new Error("checkout_already_submitted");
  if (checkout.status === "expired" || new Date(checkout.expires_at).getTime() <= now.getTime()) throw new Error("checkout_expired");

  const receiver = assertReceiverDetails({
    name: checkout.receiver_name ?? "",
    contactNumber: checkout.receiver_contact ?? "",
    addressText: checkout.delivery_address_text ?? "",
    formattedAddress: checkout.delivery_formatted_address ?? undefined,
    latitude: checkout.delivery_lat ?? undefined,
    longitude: checkout.delivery_lon ?? undefined,
  });
  if (!checkout.delivery_provider?.trim() || !safeNonNegativeInteger(checkout.delivery_fee_amount) || !checkout.delivery_fee_currency?.trim()) throw new Error("delivery_selection_required");
  requireCurrentQuote(checkout, now);
  if (!CHECKOUT_PAYMENT_METHODS.includes(checkout.delivery_fee_payment_method as CheckoutPaymentMethod)) throw new Error("delivery_fee_payment_method_invalid");

  const cart = await db.prepare(
    "SELECT ci.cart_id, ci.product_id, ci.quantity, ci.unit_price_minor, p.name FROM carts c JOIN cart_items ci ON ci.cart_id = c.id JOIN products p ON p.id = ci.product_id WHERE c.customer_id = ? AND c.status = 'active' AND ci.selected_for_checkout = 1 ORDER BY ci.created_at",
  ).bind(input.customerId).all<CartItemRow>();
  if (!cart.results.length) throw new Error("checkout_cart_empty");
  for (const item of cart.results) {
    if (!safeNonNegativeInteger(item.quantity) || item.quantity <= 0 || !safeNonNegativeInteger(item.unit_price_minor)) throw new Error("checkout_cart_item_invalid");
  }

  const subtotalMinor = cart.results.reduce((sum, item) => sum + item.quantity * item.unit_price_minor, 0);
  if (!Number.isSafeInteger(subtotalMinor)) throw new Error("checkout_subtotal_overflow");

  let discountMinor = 0;
  const normalizedCouponCode = input.couponCode?.trim() ? normalizeCouponCode(input.couponCode) : undefined;
  let coupon: CouponRow | null = null;
  if (normalizedCouponCode) {
    coupon = await db.prepare("SELECT id, code, discount_type, discount_value, min_subtotal_minor, max_discount_minor, usage_limit, usage_count, active, starts_at, ends_at FROM coupons WHERE code = ? LIMIT 1").bind(normalizedCouponCode).first<CouponRow>();
    if (!coupon) throw new Error("coupon_not_found");
    const result = calculateCoupon({
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      minSubtotalMinor: coupon.min_subtotal_minor,
      maxDiscountMinor: coupon.max_discount_minor ?? undefined,
      usageLimit: coupon.usage_limit ?? undefined,
      usageCount: coupon.usage_count,
      active: coupon.active === 1,
      startsAt: coupon.starts_at ?? undefined,
      endsAt: coupon.ends_at ?? undefined,
    }, { subtotalMinor, now });
    discountMinor = result.discountMinor;
  }

  const requestedStoreCredit = input.redeemStoreCreditMinor ?? 0;
  if (!safeNonNegativeInteger(requestedStoreCredit)) throw new Error("store_credit_invalid");
  const maxStoreCredit = subtotalMinor - discountMinor;
  const storeCreditMinor = Math.min(requestedStoreCredit, maxStoreCredit);
  if (storeCreditMinor > 0) {
    const account = await db.prepare("SELECT store_credit_minor FROM loyalty_accounts WHERE customer_id = ? LIMIT 1").bind(input.customerId).first<{ store_credit_minor: number }>();
    const currentStoreCredit = account?.store_credit_minor ?? 0;
    if (!safeNonNegativeInteger(currentStoreCredit) || storeCreditMinor > currentStoreCredit) throw new Error("insufficient_store_credit");
  }

  let referralReferrer: ReferralReferrerRow | null = null;
  let existingReferral: ReferralExistingRow | null = null;
  const normalizedReferralCode = input.referralCode?.trim() ? normalizeCouponCode(input.referralCode) : undefined;
  if (normalizedReferralCode) {
    referralReferrer = await db.prepare("SELECT id, prime_member_id FROM customers WHERE prime_member_id = ? LIMIT 1").bind(normalizedReferralCode).first<ReferralReferrerRow>();
    if (!referralReferrer) throw new Error("referral_code_not_found");
    if (referralReferrer.id === input.customerId) throw new Error("self_referral_forbidden");
    existingReferral = await db.prepare("SELECT id, status FROM referrals WHERE referred_customer_id = ? LIMIT 1").bind(input.customerId).first<ReferralExistingRow>();
    if (existingReferral && existingReferral.status !== "void") throw new Error("referral_already_applied");
  }

  const totalMinor = subtotalMinor - discountMinor - storeCreditMinor + checkout.delivery_fee_amount;
  if (!Number.isSafeInteger(totalMinor) || totalMinor < 0) throw new Error("checkout_total_invalid");

  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber(now);
  const paymentMethod = checkout.delivery_fee_payment_method as CheckoutPaymentMethod;
  const legacyStatus = paymentMethod === "PAY_NOW" ? "payment_review" : "pending_payment";
  const nowIso = now.toISOString();
  const receipt = await db.prepare("SELECT id FROM payment_receipts WHERE checkout_session_id = ? AND order_id IS NULL ORDER BY uploaded_at DESC LIMIT 1").bind(checkout.id).first<ReceiptRow>();

  const statements: D1PreparedStatementLike[] = [
    db.prepare("INSERT INTO orders (id, customer_id, status, currency, subtotal_minor, delivery_fee_minor, discount_minor, total_minor, created_at, updated_at, workflow_state, order_number, receiver_name, receiver_contact, delivery_address_text, delivery_formatted_address, delivery_lat, delivery_lon, delivery_provider, delivery_fee_payment_method, coupon_code, referral_code, store_credit_minor, loyalty_points_redeemed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REVIEW', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)").bind(
      orderId, input.customerId, legacyStatus, checkout.delivery_fee_currency.toUpperCase(), subtotalMinor, checkout.delivery_fee_amount, discountMinor, totalMinor,
      nowIso, nowIso, orderNumber, receiver.name, receiver.contactNumber, receiver.addressText, receiver.formattedAddress ?? null,
      receiver.latitude ?? null, receiver.longitude ?? null, checkout.delivery_provider, paymentMethod, normalizedCouponCode ?? null, normalizedReferralCode ?? null, storeCreditMinor,
    ),
    ...cart.results.map((item) => db.prepare("INSERT INTO order_items (id, order_id, product_id, quantity, unit_price_minor, line_total_minor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(
      crypto.randomUUID(), orderId, item.product_id, item.quantity, item.unit_price_minor, item.quantity * item.unit_price_minor, nowIso,
    )),
    db.prepare("INSERT INTO order_events (id, order_id, event_type, from_status, to_status, occurred_at, actor_type, actor_id, payload_redacted) VALUES (?, ?, 'ORDER_SUBMITTED', NULL, 'REVIEW', ?, 'customer', ?, ?)").bind(crypto.randomUUID(), orderId, nowIso, input.customerId, JSON.stringify({ paymentMethod, couponCode: normalizedCouponCode ?? null, referralCode: normalizedReferralCode ?? null })),
    db.prepare("INSERT INTO order_workflow_events (id, order_id, action, from_state, to_state, actor_type, actor_id, occurred_at, payload_redacted) VALUES (?, ?, 'SUBMIT_ORDER', NULL, 'REVIEW', 'customer', ?, ?, ?)").bind(crypto.randomUUID(), orderId, input.customerId, nowIso, JSON.stringify({ paymentMethod })),
    db.prepare("INSERT INTO checkout_events (id, checkout_session_id, event_type, payload_redacted, occurred_at) VALUES (?, ?, 'ORDER_SUBMITTED', ?, ?)").bind(crypto.randomUUID(), checkout.id, JSON.stringify({ orderId, orderNumber, totalMinor }), nowIso),
    db.prepare("UPDATE checkout_sessions SET status = 'submitted', updated_at = ? WHERE id = ? AND customer_id = ? AND status != 'submitted'").bind(nowIso, checkout.id, input.customerId),
    db.prepare("UPDATE carts SET status = 'converted', updated_at = ? WHERE id = ? AND customer_id = ? AND status = 'active'").bind(nowIso, cart.results[0].cart_id, input.customerId),
  ];

  if (receipt) statements.push(db.prepare("UPDATE payment_receipts SET order_id = ? WHERE id = ? AND checkout_session_id = ? AND order_id IS NULL").bind(orderId, receipt.id, checkout.id));
  if (coupon) {
    statements.push(db.prepare("UPDATE coupons SET usage_count = usage_count + 1, updated_at = ? WHERE id = ? AND active = 1 AND (usage_limit IS NULL OR usage_count < usage_limit)").bind(nowIso, coupon.id));
    statements.push(db.prepare("INSERT INTO coupon_redemptions (id, coupon_id, customer_id, order_id, discount_minor, redeemed_at) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), coupon.id, input.customerId, orderId, discountMinor, nowIso));
  }
  if (storeCreditMinor > 0) {
    statements.push(db.prepare("UPDATE loyalty_accounts SET store_credit_minor = store_credit_minor - ?, updated_at = ? WHERE customer_id = ? AND store_credit_minor >= ?").bind(storeCreditMinor, nowIso, input.customerId, storeCreditMinor));
    statements.push(db.prepare("INSERT INTO loyalty_transactions (id, customer_id, kind, points_delta, credit_delta_minor, reference_type, reference_id, created_at) VALUES (?, ?, 'credit', 0, ?, 'order', ?, ?)").bind(crypto.randomUUID(), input.customerId, -storeCreditMinor, orderId, nowIso));
  }
  if (normalizedReferralCode && referralReferrer) {
    if (existingReferral?.id) {
      statements.push(db.prepare("UPDATE referrals SET referrer_customer_id = ?, code = ?, status = 'pending' WHERE id = ? AND referred_customer_id = ?").bind(referralReferrer.id, normalizedReferralCode, existingReferral.id, input.customerId));
    } else {
      statements.push(db.prepare("INSERT INTO referrals (id, referrer_customer_id, referred_customer_id, code, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)").bind(crypto.randomUUID(), referralReferrer.id, input.customerId, normalizedReferralCode, nowIso));
    }
  }

  const results = await db.batch(statements);
  if (results.some((result) => !result.success)) throw new Error("checkout_submission_failed");
  return { orderId, orderNumber, workflowState: "REVIEW", subtotalMinor, deliveryFeeMinor: checkout.delivery_fee_amount, discountMinor, storeCreditMinor, totalMinor, currency: checkout.delivery_fee_currency.toUpperCase(), paymentMethod };
}
