-- PRIME Phase 2 identity + cart/order foundation.
-- Customers are created by the single-instance Telegram enrollment flow in the prior migration.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customer_enrollment_events (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  event_type TEXT NOT NULL CHECK(event_type IN ('enrolled','profile_refreshed')),
  source TEXT NOT NULL CHECK(source IN ('mini_app_exchange','bot_update')),
  occurred_at TEXT NOT NULL,
  request_id TEXT
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE REFERENCES customers(id),
  currency TEXT NOT NULL DEFAULT 'PHP',
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','converted','abandoned')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price_minor INTEGER NOT NULL CHECK(unit_price_minor >= 0),
  selected_for_checkout INTEGER NOT NULL DEFAULT 1 CHECK(selected_for_checkout IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL CHECK(status IN ('draft','pending_payment','payment_review','paid','processing','out_for_delivery','delivered','cancelled','refunded')),
  currency TEXT NOT NULL DEFAULT 'PHP',
  subtotal_minor INTEGER NOT NULL CHECK(subtotal_minor >= 0),
  delivery_fee_minor INTEGER NOT NULL DEFAULT 0 CHECK(delivery_fee_minor >= 0),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK(discount_minor >= 0),
  total_minor INTEGER NOT NULL CHECK(total_minor >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price_minor INTEGER NOT NULL CHECK(unit_price_minor >= 0),
  line_total_minor INTEGER NOT NULL CHECK(line_total_minor >= 0),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  occurred_at TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK(actor_type IN ('customer','admin','system')),
  actor_id TEXT,
  payload_redacted TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_enrollment_customer_time ON customer_enrollment_events(customer_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_time ON orders(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_time ON order_events(order_id, occurred_at);
