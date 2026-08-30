-- PRIME P1: product catalog completeness, badges, bundles, and loyalty configuration.
PRAGMA foreign_keys = ON;

ALTER TABLE products ADD COLUMN subname TEXT;
ALTER TABLE products ADD COLUMN cost_minor INTEGER NOT NULL DEFAULT 0 CHECK(cost_minor >= 0);
ALTER TABLE products ADD COLUMN compare_at_price_minor INTEGER CHECK(compare_at_price_minor IS NULL OR compare_at_price_minor >= 0);
ALTER TABLE products ADD COLUMN barcode TEXT;
ALTER TABLE products ADD COLUMN tax_inclusive INTEGER NOT NULL DEFAULT 1 CHECK(tax_inclusive IN (0,1));
ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 0 CHECK(low_stock_threshold >= 0);

CREATE UNIQUE INDEX IF NOT EXISTS ux_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

CREATE TABLE IF NOT EXISTS product_badges (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  badge TEXT NOT NULL CHECK(badge IN ('NEW','SALE','BEST_SELLER','LOW_STOCK','UNAVAILABLE')),
  created_at TEXT NOT NULL,
  PRIMARY KEY(product_id, badge)
);

CREATE TABLE IF NOT EXISTS bundle_configs (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bundle_items (
  bundle_product_id TEXT NOT NULL REFERENCES bundle_configs(product_id) ON DELETE CASCADE,
  component_product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  PRIMARY KEY(bundle_product_id, component_product_id)
);

CREATE TABLE IF NOT EXISTS loyalty_configuration (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  points_per_minor INTEGER NOT NULL DEFAULT 1 CHECK(points_per_minor >= 0),
  tier_silver_threshold INTEGER NOT NULL DEFAULT 1000 CHECK(tier_silver_threshold >= 0),
  tier_gold_threshold INTEGER NOT NULL DEFAULT 5000 CHECK(tier_gold_threshold >= 0),
  tier_platinum_threshold INTEGER NOT NULL DEFAULT 10000 CHECK(tier_platinum_threshold >= 0),
  points_per_credit_minor INTEGER NOT NULL DEFAULT 100 CHECK(points_per_credit_minor > 0),
  referral_minimum_order_minor INTEGER NOT NULL DEFAULT 0 CHECK(referral_minimum_order_minor >= 0),
  referrer_points INTEGER NOT NULL DEFAULT 0 CHECK(referrer_points >= 0),
  referred_points INTEGER NOT NULL DEFAULT 0 CHECK(referred_points >= 0),
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO loyalty_configuration (id, updated_at) VALUES (1, CURRENT_TIMESTAMP);
