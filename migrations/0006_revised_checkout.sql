-- PRIME revised checkout flow.
-- Receipt analysis is enrichment only and must never block order submission.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL CHECK(status IN ('review_cart','receiver_details','delivery_selection','order_review','payment','submitted','expired')),
  receiver_name TEXT,
  receiver_contact TEXT,
  delivery_address_text TEXT,
  delivery_formatted_address TEXT,
  delivery_lat REAL,
  delivery_lon REAL,
  delivery_provider TEXT,
  delivery_fee_amount INTEGER,
  delivery_fee_currency TEXT,
  delivery_fee_payment_method TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checkout_events (
  id TEXT PRIMARY KEY,
  checkout_session_id TEXT NOT NULL REFERENCES checkout_sessions(id),
  event_type TEXT NOT NULL,
  payload_redacted TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_receipts (
  id TEXT PRIMARY KEY,
  checkout_session_id TEXT NOT NULL REFERENCES checkout_sessions(id),
  order_id TEXT,
  object_key TEXT NOT NULL,
  media_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  taggun_status TEXT NOT NULL DEFAULT 'pending' CHECK(taggun_status IN ('pending','analyzed','failed')),
  taggun_result TEXT,
  uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  analyzed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_checkout_customer_status ON checkout_sessions(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_checkout_events_session_time ON checkout_events(checkout_session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_order ON payment_receipts(order_id);
