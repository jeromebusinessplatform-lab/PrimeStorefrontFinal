export type ProductBadge = "NEW" | "SALE" | "BEST_SELLER" | "LOW_STOCK" | "UNAVAILABLE";

export interface BadgeContext {
  isNew: boolean;
  compareAtPriceMinor?: number | null;
  priceMinor: number;
  unitsSold: number;
  bestSellerThreshold: number;
  stockAvailable: number;
  lowStockThreshold: number;
  active: boolean;
}

export function evaluateProductBadges(context: BadgeContext): ProductBadge[] {
  if (!Number.isSafeInteger(context.priceMinor) || context.priceMinor < 0) throw new Error("price_invalid");
  if (context.compareAtPriceMinor !== undefined && context.compareAtPriceMinor !== null && (!Number.isSafeInteger(context.compareAtPriceMinor) || context.compareAtPriceMinor < 0)) throw new Error("compare_at_price_invalid");
  if (!Number.isSafeInteger(context.unitsSold) || context.unitsSold < 0) throw new Error("units_sold_invalid");
  if (!Number.isSafeInteger(context.bestSellerThreshold) || context.bestSellerThreshold < 0) throw new Error("best_seller_threshold_invalid");
  if (!Number.isSafeInteger(context.stockAvailable) || context.stockAvailable < 0) throw new Error("stock_invalid");
  if (!Number.isSafeInteger(context.lowStockThreshold) || context.lowStockThreshold < 0) throw new Error("low_stock_threshold_invalid");

  const badges: ProductBadge[] = [];
  if (context.isNew) badges.push("NEW");
  if (context.compareAtPriceMinor !== undefined && context.compareAtPriceMinor !== null && context.compareAtPriceMinor > context.priceMinor) badges.push("SALE");
  if (context.unitsSold >= context.bestSellerThreshold) badges.push("BEST_SELLER");
  if (!context.active || context.stockAvailable <= 0) badges.push("UNAVAILABLE");
  else if (context.stockAvailable <= context.lowStockThreshold) badges.push("LOW_STOCK");
  return badges;
}
