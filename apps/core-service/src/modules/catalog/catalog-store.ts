export type ProductBadge = "NEW" | "SALE" | "BEST_SELLER" | "LOW_STOCK" | "UNAVAILABLE";

interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}
interface D1Like { prepare(sql: string): D1PreparedStatementLike; batch(statements: D1PreparedStatementLike[]): Promise<{ success: boolean }[]>; }

export interface ProductInput {
  name: string;
  subname?: string | null;
  categoryId?: string | null;
  description?: string | null;
  priceMinor: number;
  costMinor: number;
  compareAtPriceMinor?: number | null;
  stocksAvailable: number;
  lowStockThreshold: number;
  sku?: string;
  barcode?: string | null;
  taxInclusive: boolean;
  imageObjectKey?: string | null;
  badge?: ProductBadge | null;
}

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  subname: string | null;
  slug: string;
  description: string | null;
  categoryId: string | null;
  priceMinor: number;
  costMinor: number;
  compareAtPriceMinor: number | null;
  marginMinor: number;
  barcode: string | null;
  taxInclusive: boolean;
  stocksAvailable: number;
  lowStockThreshold: number;
  status: string;
  imageObjectKey: string | null;
  badges: ProductBadge[];
}

function safeNonNegativeInt(value: unknown, name: string): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${name}_invalid`);
}
function slugify(value: string): string {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  if (!slug) throw new Error("product_name_invalid");
  return slug;
}
function autoSku(): string { return `PRM-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`; }
function autoBarcode(): string { return crypto.randomUUID().replace(/-/g, "").split("").map((char) => (parseInt(char, 16) % 10).toString()).join("").slice(0, 12); }
function validateBadge(badge: ProductBadge | null | undefined): void {
  if (badge !== undefined && badge !== null && !["NEW","SALE","BEST_SELLER","LOW_STOCK","UNAVAILABLE"].includes(badge)) throw new Error("badge_invalid");
}
function validateProductInput(input: ProductInput): void {
  if (!input.name?.trim()) throw new Error("product_name_required");
  safeNonNegativeInt(input.priceMinor, "price");
  safeNonNegativeInt(input.costMinor, "cost");
  safeNonNegativeInt(input.stocksAvailable, "stock");
  safeNonNegativeInt(input.lowStockThreshold, "low_stock_threshold");
  if (input.compareAtPriceMinor !== undefined && input.compareAtPriceMinor !== null) safeNonNegativeInt(input.compareAtPriceMinor, "compare_at_price");
  validateBadge(input.badge);
}

export function productMarginMinor(priceMinor: number, costMinor: number): number {
  safeNonNegativeInt(priceMinor, "price");
  safeNonNegativeInt(costMinor, "cost");
  return priceMinor - costMinor;
}

export async function listProducts(db: D1Like): Promise<ProductRow[]> {
  const result = await db.prepare(
    `SELECT p.id, p.sku, p.name, p.subname, p.slug, p.description, p.category_id, p.price_minor, p.cost_minor,
            p.compare_at_price_minor, p.barcode, p.tax_inclusive, p.status, p.low_stock_threshold,
            COALESCE(i.on_hand, 0) - COALESCE(i.reserved, 0) AS stocks_available, pi.object_key AS image_object_key
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0
      ORDER BY p.created_at DESC`).all<Record<string, unknown>>();
  const badges = await db.prepare("SELECT product_id, badge FROM product_badges ORDER BY product_id, badge").all<{ product_id: string; badge: ProductBadge }>();
  const badgeMap = new Map<string, ProductBadge[]>();
  for (const row of badges.results) badgeMap.set(row.product_id, [...(badgeMap.get(row.product_id) ?? []), row.badge]);
  return result.results.map((row) => ({
    id: String(row.id), sku: String(row.sku), name: String(row.name), subname: row.subname ? String(row.subname) : null,
    slug: String(row.slug), description: row.description ? String(row.description) : null, categoryId: row.category_id ? String(row.category_id) : null,
    priceMinor: Number(row.price_minor), costMinor: Number(row.cost_minor), compareAtPriceMinor: row.compare_at_price_minor == null ? null : Number(row.compare_at_price_minor),
    marginMinor: productMarginMinor(Number(row.price_minor), Number(row.cost_minor)), barcode: row.barcode ? String(row.barcode) : null,
    taxInclusive: Number(row.tax_inclusive) === 1, stocksAvailable: Number(row.stocks_available), lowStockThreshold: Number(row.low_stock_threshold),
    status: String(row.status), imageObjectKey: row.image_object_key ? String(row.image_object_key) : null, badges: badgeMap.get(String(row.id)) ?? [],
  }));
}

export async function createProduct(db: D1Like, input: ProductInput, now = new Date()): Promise<{ id: string; sku: string; barcode: string }> {
  validateProductInput(input);
  const id = crypto.randomUUID();
  const sku = input.sku?.trim().toUpperCase() || autoSku();
  const barcode = input.barcode?.trim() || autoBarcode();
  const slug = `${slugify(input.name)}-${id.slice(0, 8)}`;
  const timestamp = now.toISOString();
  const statements = [
    db.prepare(`INSERT INTO products (id, sku, name, slug, description, category_id, price_minor, currency, status, created_at, updated_at, subname, cost_minor, compare_at_price_minor, barcode, tax_inclusive, low_stock_threshold)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PHP', 'draft', ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, sku, input.name.trim(), slug, input.description?.trim() || null, input.categoryId ?? null, input.priceMinor, timestamp, timestamp, input.subname?.trim() || null, input.costMinor, input.compareAtPriceMinor ?? null, barcode, input.taxInclusive ? 1 : 0, input.lowStockThreshold),
    db.prepare("INSERT INTO inventory (product_id, on_hand, reserved, updated_at) VALUES (?, ?, 0, ?)").bind(id, input.stocksAvailable, timestamp),
  ];
  if (input.imageObjectKey?.trim()) statements.push(db.prepare("INSERT INTO product_images (id, product_id, object_key, sort_order, created_at) VALUES (?, ?, ?, 0, ?)").bind(crypto.randomUUID(), id, input.imageObjectKey.trim(), timestamp));
  if (input.badge) statements.push(db.prepare("INSERT INTO product_badges (product_id, badge, created_at) VALUES (?, ?, ?)").bind(id, input.badge, timestamp));
  const results = await db.batch(statements);
  if (results.some((result) => !result.success)) throw new Error("product_create_failed");
  return { id, sku, barcode };
}
