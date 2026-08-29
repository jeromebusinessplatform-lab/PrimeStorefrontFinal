-- PRIME Sprint 2: data-driven delivery configuration.
-- Single-instance deployment: no tenant column required.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN (0,1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_warehouses_one_default
ON warehouses(is_default) WHERE is_default = 1;
CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(is_active, name);

CREATE TABLE IF NOT EXISTS couriers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('standard','express','priority')),
  logo_object_key TEXT,
  base_fee_minor INTEGER NOT NULL CHECK(base_fee_minor >= 0),
  per_km_rate_minor INTEGER NOT NULL CHECK(per_km_rate_minor >= 0),
  platform_fee_minor INTEGER NOT NULL DEFAULT 0 CHECK(platform_fee_minor >= 0),
  surcharge_minor INTEGER NOT NULL DEFAULT 0 CHECK(surcharge_minor >= 0),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_couriers_active_type ON couriers(is_active, type, name);
