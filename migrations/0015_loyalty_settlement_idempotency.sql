-- PRIME Sprint 3: make paid-order loyalty settlement idempotent at the database layer.
PRAGMA foreign_keys = ON;

CREATE UNIQUE INDEX IF NOT EXISTS uq_loyalty_order_payment_earn
  ON loyalty_transactions(reference_type, reference_id, kind)
  WHERE reference_type = 'order_payment' AND kind = 'earn';
