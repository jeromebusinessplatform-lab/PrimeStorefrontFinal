-- PRIME order-control overrides.
-- Customer modification closes at READY; customer cancellation closes at AWAITING_RIDER.
-- Dispatch requires a tracking link so the customer can render TRACK.
PRAGMA foreign_keys = ON;

ALTER TABLE orders ADD COLUMN tracking_link TEXT;
ALTER TABLE orders ADD COLUMN dispatched_at TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_link ON orders(tracking_link);
