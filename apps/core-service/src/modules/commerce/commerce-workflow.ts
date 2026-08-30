import { transitionOrder, type OrderAction, type OrderWorkflowState } from "../orders/order-workflow";
import { calculateCoupon, type CouponResult, type CouponRule } from "../promotions/promotion-engine";
import { earnPoints, pointsEarned, type LoyaltyAccount, type LoyaltyPolicy } from "../loyalty/loyalty-engine";

export interface CommerceQuote {
  subtotalMinor: number;
  deliveryFeeMinor: number;
  discountMinor: number;
  storeCreditMinor: number;
  totalMinor: number;
  currency: string;
}

export interface CommerceOrderContext {
  state: OrderWorkflowState;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  currency: string;
  coupon?: CouponResult;
  storeCreditMinor?: number;
}

export interface LoyaltyApplication {
  account: LoyaltyAccount;
  earnedPoints: number;
}

export function buildCommerceQuote(input: Omit<CommerceOrderContext, "state"> & { couponRule?: CouponRule }): CommerceQuote {
  if (!Number.isSafeInteger(input.subtotalMinor) || input.subtotalMinor < 0) throw new Error("subtotal_invalid");
  if (!Number.isSafeInteger(input.deliveryFeeMinor) || input.deliveryFeeMinor < 0) throw new Error("delivery_fee_invalid");
  if (!input.currency.trim()) throw new Error("currency_required");
  const coupon = input.couponRule ? calculateCoupon(input.couponRule, { subtotalMinor: input.subtotalMinor }) : undefined;
  const discountMinor = coupon?.discountMinor ?? 0;
  const availableAfterCoupon = input.subtotalMinor - discountMinor;
  const storeCreditMinor = Math.min(input.storeCreditMinor ?? 0, availableAfterCoupon);
  if (!Number.isSafeInteger(storeCreditMinor) || storeCreditMinor < 0) throw new Error("store_credit_invalid");
  return Object.freeze({
    subtotalMinor: input.subtotalMinor,
    deliveryFeeMinor: input.deliveryFeeMinor,
    discountMinor,
    storeCreditMinor,
    totalMinor: availableAfterCoupon - storeCreditMinor + input.deliveryFeeMinor,
    currency: input.currency.trim().toUpperCase(),
  });
}

export function applyCommerceOrderAction(state: OrderWorkflowState, action: OrderAction, trackingLink?: string): OrderWorkflowState {
  return transitionOrder({ state, action, trackingLink });
}

export function applyLoyaltyForPaidOrder(account: LoyaltyAccount, quote: CommerceQuote, policy: LoyaltyPolicy): LoyaltyApplication {
  const earnedPoints = pointsEarned(quote.totalMinor, policy);
  return Object.freeze({ earnedPoints, account: earnPoints(account, earnedPoints, policy) });
}
