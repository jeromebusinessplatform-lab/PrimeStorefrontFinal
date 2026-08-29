-- PRIME Phase 1.1: single-instance security model.
-- No production tenant data exists in this greenfield repository; the obsolete foundation is removed forward.
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS audit_events;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS operator_accounts;
DROP TABLE IF EXISTS telegram_profile_history;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS telegram_bots;
DROP TABLE IF EXISTS tenants;
PRAGMA foreign_keys = ON;

CREATE TABLE telegram_bots (
  id TEXT PRIMARY KEY,
  telegram_bot_id TEXT NOT NULL UNIQUE,
  bot_key TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL
);

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES telegram_bots(id),
  telegram_user_id TEXT NOT NULL,
  prime_member_id TEXT NOT NULL UNIQUE,
  telegram_first_name TEXT NOT NULL,
  telegram_last_name TEXT,
  telegram_username TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(bot_id, telegram_user_id)
);

CREATE TABLE telegram_profile_history (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  profile_name TEXT NOT NULL,
  username TEXT,
  observed_at TEXT NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('bot_update','mini_app_exchange')),
  safe_reference TEXT
);

CREATE TABLE platform_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  session_digest TEXT NOT NULL UNIQUE,
  csrf_digest TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  idle_expires_at TEXT NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE TABLE admin_audit_events (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES admin_sessions(id),
  action TEXT NOT NULL,
  request_id TEXT,
  occurred_at TEXT NOT NULL,
  payload_redacted TEXT NOT NULL,
  previous_hash TEXT,
  event_hash TEXT NOT NULL UNIQUE
);

CREATE TABLE telegram_update_dedup (
  bot_id TEXT NOT NULL REFERENCES telegram_bots(id),
  update_id INTEGER NOT NULL,
  received_at TEXT NOT NULL,
  PRIMARY KEY(bot_id, update_id)
);

CREATE INDEX idx_customers_bot ON customers(bot_id);
CREATE INDEX idx_profile_history_customer ON telegram_profile_history(customer_id, observed_at);
CREATE INDEX idx_admin_sessions_active ON admin_sessions(revoked_at, idle_expires_at, absolute_expires_at);
CREATE INDEX idx_admin_audit_time ON admin_audit_events(occurred_at);
CREATE INDEX idx_telegram_dedup_received ON telegram_update_dedup(received_at);
