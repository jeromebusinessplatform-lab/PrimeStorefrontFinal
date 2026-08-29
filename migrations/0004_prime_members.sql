-- PRIME Member enrollment
CREATE TABLE IF NOT EXISTS prime_members (
  member_id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_profiles (
  member_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  mobile TEXT,
  email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(member_id) REFERENCES prime_members(member_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prime_members_telegram_user
ON prime_members(telegram_user_id);
