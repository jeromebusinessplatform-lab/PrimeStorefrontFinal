-- PRIME Sprint 4: payment, proof, reconciliation, review, and confirmation state.
PRAGMA foreign_keys = ON;

ALTER TABLE orders ADD COLUMN order_no TEXT;
ALTER TABLE orders ADD COLUMN payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN submitted_at TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no) WHERE order_no IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  method_type TEXT NOT NULL CHECK(method_type IN ('qr_ph','card_gateway')),
  label TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  qr_object_key TEXT,
  gateway_name TEXT,
  currency TEXT NOT NULL DEFAULT 'PHP',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_intents (
  id TEXT PRIMARY KEY,
  checkout_session_id TEXT NOT NULL REFERENCES checkout_sessions(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  method_type TEXT NOT NULL CHECK(method_type IN ('qr_ph','card_gateway')),
  amount_minor INTEGER NOT NULL CHECK(amount_minor >= 0),
  currency TEXT NOT NULL,
  quote_snapshot TEXT NOT NULL,
  quote_fingerprint TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','submitted','settled','reconciled','expired','cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(checkout_session_id)
);

CREATE TABLE IF NOT EXISTS payment_proofs (
  id TEXT PRIMARY KEY,
  payment_intent_id TEXT NOT NULL REFERENCES payment_intents(id),
  object_key TEXT NOT NULL UNIQUE,
  sha256 TEXT NOT NULL,
  media_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK(size_bytes > 0),
  analysis_status TEXT NOT NULL DEFAULT 'pending' CHECK(analysis_status IN ('pending','validated','unvalidated','rejected')),
  analysis_result TEXT,
  uploaded_at TEXT NOT NULL,
  analyzed_at TEXT
);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  payment_intent_id TEXT,
  amount_minor INTEGER,
  currency TEXT,
  signature_valid INTEGER NOT NULL CHECK(signature_valid IN (0,1)),
  status TEXT NOT NULL CHECK(status IN ('accepted','rejected','duplicate')),
  payload_redacted TEXT NOT NULL,
  received_at TEXT NOT NULL,
  UNIQUE(provider, external_event_id)
);

CREATE TABLE IF NOT EXISTS payment_reviews (
  id TEXT PRIMARY KEY,
  payment_intent_id TEXT NOT NULL REFERENCES payment_intents(id),
  proof_id TEXT REFERENCES payment_proofs(id),
  decision TEXT NOT NULL CHECK(decision IN ('pending','approved','rejected','needs_resubmission','reconciled')),
  reviewer_id TEXT,
  reason TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(payment_intent_id, proof_id, decision)
);

CREATE TABLE IF NOT EXISTS order_confirmation_snapshots (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  row_order INTEGER NOT NULL CHECK(row_order BETWEEN 1 AND 5),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(order_id, row_order)
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_customer ON payment_intents(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_intent ON payment_proofs(payment_intent_id, uploaded_at);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_intent ON payment_webhook_events(payment_intent_id, received_at);
CREATE INDEX IF NOT EXISTS idx_payment_reviews_decision ON payment_reviews(decision, created_at);
CREATE INDEX IF NOT EXISTS idx_order_confirmation_order ON order_confirmation_snapshots(order_id, row_order);
