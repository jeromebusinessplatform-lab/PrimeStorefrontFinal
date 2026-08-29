-- Phase 2 customer enrollment
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  prime_member_id TEXT NOT NULL UNIQUE,
  telegram_user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_enrollment_events (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id)
);
