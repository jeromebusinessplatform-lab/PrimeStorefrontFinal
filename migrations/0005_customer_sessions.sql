-- Phase 2.1 revocable customer sessions for verified Telegram Mini App exchanges.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customer_sessions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  session_digest TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  idle_expires_at TEXT NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_customer_sessions_active ON customer_sessions(customer_id, revoked_at, idle_expires_at, absolute_expires_at);
