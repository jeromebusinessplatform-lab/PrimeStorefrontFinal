export type DiscountType = "fixed" | "percent";

export interface CouponRule {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minSubtotalMinor?: number;
  maxDiscountMinor?: number;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface PromotionContext {
  subtotalMinor: number;
  now?: Date;
}

export interface CouponResult {
  code: string;
  discountMinor: number;
  totalMinor: number;
}

export class InvalidCoupon extends Error {
  constructor(code: string) {
    super(code);
    this.name = "InvalidCoupon";
  }
}

function assertSafeMinor(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new InvalidCoupon(`${field}_invalid`);
}

export function normalizeCouponCode(value: string): string {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(code)) throw new InvalidCoupon("coupon_code_invalid");
  return code;
}

export function calculateCoupon(rule: CouponRule, context: PromotionContext): CouponResult {
  assertSafeMinor(context.subtotalMinor, "subtotal");
  if (!rule.active) throw new InvalidCoupon("coupon_inactive");
  const code = normalizeCouponCode(rule.code);
  if (rule.usageLimit !== undefined && rule.usageCount >= rule.usageLimit) throw new InvalidCoupon("coupon_usage_limit_reached");
  if (context.subtotalMinor < (rule.minSubtotalMinor ?? 0)) throw new InvalidCoupon("coupon_minimum_not_met");
  const now = context.now ?? new Date();
  if (rule.startsAt && now < new Date(rule.startsAt)) throw new InvalidCoupon("coupon_not_started");
  if (rule.endsAt && now > new Date(rule.endsAt)) throw new InvalidCoupon("coupon_expired");
  assertSafeMinor(rule.discountValue, "discount_value");
  let discountMinor = rule.discountType === "fixed"
    ? Math.min(rule.discountValue, context.subtotalMinor)
    : Math.floor(context.subtotalMinor * rule.discountValue / 100);
  if (rule.discountType === "percent" && (rule.discountValue > 100)) throw new InvalidCoupon("coupon_percent_invalid");
  if (rule.maxDiscountMinor !== undefined) discountMinor = Math.min(discountMinor, rule.maxDiscountMinor);
  discountMinor = Math.min(discountMinor, context.subtotalMinor);
  return Object.freeze({ code, discountMinor, totalMinor: context.subtotalMinor - discountMinor });
}

export function composeDiscounts(subtotalMinor: number, coupon?: CouponResult, storeCreditMinor = 0): number {
  assertSafeMinor(subtotalMinor, "subtotal");
  assertSafeMinor(storeCreditMinor, "store_credit");
  const couponDiscount = coupon?.discountMinor ?? 0;
  if (!Number.isSafeInteger(couponDiscount) || couponDiscount < 0) throw new InvalidCoupon("coupon_discount_invalid");
  return Math.max(0, subtotalMinor - Math.min(subtotalMinor, couponDiscount) - Math.min(subtotalMinor - Math.min(subtotalMinor, couponDiscount), storeCreditMinor));
}
