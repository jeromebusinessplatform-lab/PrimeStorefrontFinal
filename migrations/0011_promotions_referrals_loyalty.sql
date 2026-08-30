-- PRIME Sprint 3: promotions, referrals, and loyalty persistence.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('fixed','percent')),
  discount_value INTEGER NOT NULL CHECK(discount_value >= 0),
  min_subtotal_minor INTEGER NOT NULL DEFAULT 0 CHECK(min_subtotal_minor >= 0),
  max_discount_minor INTEGER,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK(usage_count >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL REFERENCES coupons(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  order_id TEXT REFERENCES orders(id),
  discount_minor INTEGER NOT NULL CHECK(discount_minor >= 0),
  redeemed_at TEXT NOT NULL,
  UNIQUE(coupon_id, customer_id, order_id)
);

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_customer_id TEXT NOT NULL REFERENCES customers(id),
  referred_customer_id TEXT NOT NULL UNIQUE REFERENCES customers(id),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('pending','qualified','rewarded','void')),
  created_at TEXT NOT NULL,
  qualified_at TEXT,
  rewarded_at TEXT
);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  customer_id TEXT PRIMARY KEY REFERENCES customers(id),
  points_balance INTEGER NOT NULL DEFAULT 0 CHECK(points_balance >= 0),
  lifetime_points INTEGER NOT NULL DEFAULT 0 CHECK(lifetime_points >= 0),
  store_credit_minor INTEGER NOT NULL DEFAULT 0 CHECK(store_credit_minor >= 0),
  tier TEXT NOT NULL DEFAULT 'member',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  kind TEXT NOT NULL CHECK(kind IN ('earn','redeem','adjust','referral','credit')),
  points_delta INTEGER NOT NULL,
  credit_delta_minor INTEGER NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_customer ON coupon_redemptions(customer_id, redeemed_at);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_customer_id, status);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_id, created_at);
