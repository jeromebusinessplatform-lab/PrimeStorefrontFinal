import { execFileSync } from "node:child_process";

const database = "prime-commerce-production";
const config = "wrangler.toml";
const env = "production";
const migrationName = "0007_order_control_overrides.sql";

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

// Ensure the standard Wrangler migration ledger exists before inspecting it.
run(
  "CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)",
);

const applied = rows(run(`SELECT name FROM d1_migrations WHERE name = '${migrationName}' LIMIT 1`));

if (applied.length > 0) {
  console.log(`D1 migration ${migrationName} is already recorded as applied; no repair required.`);
  process.exit(0);
}

const columns = rows(run("PRAGMA table_info('orders')"));
const columnNames = new Set(columns.map((column) => column.name));

if (!columnNames.has("tracking_link")) {
  console.log("tracking_link is missing; adding it.");
  run("ALTER TABLE orders ADD COLUMN tracking_link TEXT");
} else {
  console.log("tracking_link already exists; skipping duplicate ALTER TABLE.");
}

if (!columnNames.has("dispatched_at")) {
  console.log("dispatched_at is missing; adding it.");
  run("ALTER TABLE orders ADD COLUMN dispatched_at TEXT");
} else {
  console.log("dispatched_at already exists; skipping duplicate ALTER TABLE.");
}

run("CREATE INDEX IF NOT EXISTS idx_orders_tracking_link ON orders(tracking_link)");
run(`INSERT INTO d1_migrations (name) VALUES ('${migrationName}')`);

console.log(`Reconciled and recorded ${migrationName}.`);
