-- PRIME Phase 1 baseline. Forward-only migration.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  default_locale TEXT NOT NULL DEFAULT 'en-PH',
  default_currency TEXT NOT NULL DEFAULT 'PHP',
  default_timezone TEXT NOT NULL DEFAULT 'Asia/Manila',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS telegram_bots (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  telegram_bot_id TEXT NOT NULL,
  bot_key TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL,
  UNIQUE(tenant_id, telegram_bot_id),
  UNIQUE(tenant_id, bot_key)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  bot_id TEXT NOT NULL REFERENCES telegram_bots(id),
  telegram_user_id TEXT NOT NULL,
  prime_member_id TEXT NOT NULL,
  telegram_first_name TEXT NOT NULL,
  telegram_last_name TEXT,
  telegram_username TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(tenant_id, bot_id, telegram_user_id),
  UNIQUE(prime_member_id)
);

CREATE TABLE IF NOT EXISTS telegram_profile_history (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  profile_name TEXT NOT NULL,
  username TEXT,
  observed_at TEXT NOT NULL,
  source TEXT NOT NULL,
  safe_reference TEXT
);

CREATE TABLE IF NOT EXISTS operator_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  telegram_user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(tenant_id, telegram_user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  subject_type TEXT NOT NULL CHECK(subject_type IN ('customer','operator')),
  subject_id TEXT NOT NULL,
  token_digest TEXT NOT NULL UNIQUE,
  csrf_digest TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  idle_expires_at TEXT NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  revoked_at TEXT,
  rotation_version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  request_id TEXT,
  occurred_at TEXT NOT NULL,
  payload_redacted TEXT NOT NULL,
  previous_hash TEXT,
  event_hash TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_bots_tenant ON telegram_bots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profile_history_customer ON telegram_profile_history(tenant_id, customer_id, observed_at);
CREATE INDEX IF NOT EXISTS idx_operators_tenant ON operator_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(tenant_id, subject_type, subject_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON audit_events(tenant_id, occurred_at);
