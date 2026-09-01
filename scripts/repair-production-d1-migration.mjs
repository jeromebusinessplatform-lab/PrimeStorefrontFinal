import { execFileSync } from "node:child_process";

const database = "prime-commerce-production";
const config = "wrangler.toml";
const env = "production";

function run(sql) {
  const output = execFileSync(
    "pnpm",
    [
      "dlx",
      "wrangler@latest",
      "d1",
      "execute",
      database,
      "--remote",
      "--config",
      config,
      "--env",
      env,
      "--command",
      sql,
      "--json",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );

  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Unable to parse Wrangler JSON output for SQL: ${sql}`);
  }
}

function rows(result) {
  const value = result?.results;
  if (!Array.isArray(value)) return [];
  if (value.every((item) => item && Array.isArray(item.results))) {
    return value.flatMap((item) => item.results);
  }
  return value;
}

function appliedMigrations() {
  return new Set(rows(run("SELECT name FROM d1_migrations")).map((row) => row.name));
}

function getColumns(table) {
  // Use SQLite's pragma_table_info() table-valued function instead of a PRAGMA
  // statement. This makes the schema introspection deterministic through the
  // Wrangler D1 JSON query path and avoids false "missing column" results.
  const safeTable = table.replaceAll("'", "''");
  return new Set(
    rows(run(`SELECT name FROM pragma_table_info('${safeTable}')`)).map((column) => column.name),
  );
}

function ensureColumn(table, column, definition, columnNames) {
  if (columnNames.has(column)) {
    console.log(`${table}.${column} already exists; skipping ALTER TABLE.`);
    return;
  }
  console.log(`${table}.${column} is missing; adding it.`);
  run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  columnNames.add(column);
}

function recordMigration(name) {
  run(`INSERT OR IGNORE INTO d1_migrations (name) VALUES ('${name}')`);
  console.log(`D1 migration ${name} is reconciled and recorded.`);
}

// Ensure the standard Wrangler migration ledger exists before inspecting it.
run(
  "CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)",
);

let applied = appliedMigrations();

// 0007 was historically applied to production without its Wrangler ledger entry.
// Reconcile the actual schema instead of replaying ALTER TABLE blindly.
const migration0007 = "0007_order_control_overrides.sql";
if (!applied.has(migration0007)) {
  const orders = getColumns("orders");
  ensureColumn("orders", "tracking_link", "TEXT", orders);
  ensureColumn("orders", "dispatched_at", "TEXT", orders);
  run("CREATE INDEX IF NOT EXISTS idx_orders_tracking_link ON orders(tracking_link)");
  recordMigration(migration0007);
} else {
  console.log(`D1 migration ${migration0007} is already recorded; no repair required.`);
}

// 0012_checkout_order_authority can also be partially applied in production.
// Reconcile every column before letting Wrangler continue with later migrations.
const migration0012 = "0012_checkout_order_authority.sql";
if (!applied.has(migration0012)) {
  const orders = getColumns("orders");
  ensureColumn("orders", "order_number", "TEXT", orders);
  ensureColumn("orders", "receiver_name", "TEXT", orders);
  ensureColumn("orders", "receiver_contact", "TEXT", orders);
  ensureColumn("orders", "delivery_address_text", "TEXT", orders);
  ensureColumn("orders", "delivery_formatted_address", "TEXT", orders);
  ensureColumn("orders", "delivery_lat", "REAL", orders);
  ensureColumn("orders", "delivery_lon", "REAL", orders);
  ensureColumn("orders", "delivery_provider", "TEXT", orders);
  ensureColumn("orders", "delivery_fee_payment_method", "TEXT", orders);
  ensureColumn("orders", "coupon_code", "TEXT", orders);
  ensureColumn("orders", "referral_code", "TEXT", orders);
  ensureColumn("orders", "store_credit_minor", "INTEGER NOT NULL DEFAULT 0 CHECK(store_credit_minor >= 0)", orders);
  ensureColumn("orders", "loyalty_points_redeemed", "INTEGER NOT NULL DEFAULT 0 CHECK(loyalty_points_redeemed >= 0)", orders);

  run("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)");
  run("CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON orders(referral_code)");
  run("CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code)");
  recordMigration(migration0012);
} else {
  console.log(`D1 migration ${migration0012} is already recorded; no repair required.`);
}

console.log("Production D1 migration drift reconciliation completed.");
