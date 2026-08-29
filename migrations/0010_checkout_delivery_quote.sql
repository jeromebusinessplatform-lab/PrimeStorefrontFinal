-- Persist the server-authoritative delivery quote linkage on a checkout session.
PRAGMA foreign_keys = ON;

ALTER TABLE checkout_sessions ADD COLUMN delivery_warehouse_id TEXT REFERENCES warehouses(id);
ALTER TABLE checkout_sessions ADD COLUMN delivery_courier_id TEXT REFERENCES couriers(id);
ALTER TABLE checkout_sessions ADD COLUMN delivery_distance_meters INTEGER;
ALTER TABLE checkout_sessions ADD COLUMN delivery_duration_seconds INTEGER;
ALTER TABLE checkout_sessions ADD COLUMN delivery_base_fee_minor INTEGER;
ALTER TABLE checkout_sessions ADD COLUMN delivery_distance_fee_minor INTEGER;
ALTER TABLE checkout_sessions ADD COLUMN delivery_platform_fee_minor INTEGER DEFAULT 0;
ALTER TABLE checkout_sessions ADD COLUMN delivery_surcharge_minor INTEGER DEFAULT 0;
ALTER TABLE checkout_sessions ADD COLUMN delivery_quote_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE checkout_sessions ADD COLUMN delivery_quote_expires_at TEXT;

CREATE INDEX IF NOT EXISTS idx_checkout_delivery_warehouse ON checkout_sessions(delivery_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_checkout_delivery_courier ON checkout_sessions(delivery_courier_id);
