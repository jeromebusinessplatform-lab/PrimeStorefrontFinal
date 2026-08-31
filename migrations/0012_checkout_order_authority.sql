-- PRIME P0: make checkout submission persist the authoritative order snapshot.
-- Forward-only migration; legacy status remains for compatibility while workflow_state stays authoritative.
-- tracking_link is already introduced by 0007_order_control_overrides.sql; do not add it again here.
PRAGMA foreign_keys = ON;

ALTER TABLE orders ADD COLUMN order_number TEXT;
ALTER TABLE orders ADD COLUMN receiver_name TEXT;
ALTER TABLE orders ADD COLUMN receiver_contact TEXT;
ALTER TABLE orders ADD COLUMN delivery_address_text TEXT;
ALTER TABLE orders ADD COLUMN delivery_formatted_address TEXT;
ALTER TABLE orders ADD COLUMN delivery_lat REAL;
ALTER TABLE orders ADD COLUMN delivery_lon REAL;
ALTER TABLE orders ADD COLUMN delivery_provider TEXT;
ALTER TABLE orders ADD COLUMN delivery_fee_payment_method TEXT;
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
ALTER TABLE orders ADD COLUMN referral_code TEXT;
ALTER TABLE orders ADD COLUMN store_credit_minor INTEGER NOT NULL DEFAULT 0 CHECK(store_credit_minor >= 0);
ALTER TABLE orders ADD COLUMN loyalty_points_redeemed INTEGER NOT NULL DEFAULT 0 CHECK(loyalty_points_redeemed >= 0);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON orders(referral_code);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);
