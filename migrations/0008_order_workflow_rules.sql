-- PRIME revised order workflow.
-- Keep the legacy orders.status column for compatibility; workflow_state is authoritative for UI/business transitions.
PRAGMA foreign_keys = ON;

ALTER TABLE orders ADD COLUMN workflow_state TEXT NOT NULL DEFAULT 'REVIEW';
ALTER TABLE orders ADD COLUMN tracking_link TEXT;
ALTER TABLE orders ADD COLUMN dispatched_at TEXT;
ALTER TABLE orders ADD COLUMN modification_locked_at TEXT;
ALTER TABLE orders ADD COLUMN cancellation_locked_at TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_workflow_state ON orders(workflow_state, updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_workflow ON orders(customer_id, workflow_state, updated_at);

CREATE TABLE IF NOT EXISTS order_workflow_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  actor_type TEXT NOT NULL CHECK(actor_type IN ('customer','admin','system')),
  actor_id TEXT,
  tracking_link TEXT,
  occurred_at TEXT NOT NULL,
  payload_redacted TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_workflow_events_order_time ON order_workflow_events(order_id, occurred_at);
