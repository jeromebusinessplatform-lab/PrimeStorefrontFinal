export interface EnrollmentInput {
  readonly telegramUserId: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly username?: string;
  readonly source: "mini_app_exchange" | "bot_update";
  readonly requestId?: string;
}

export interface EnrollmentResult {
  readonly customerId: string;
  readonly primeMemberId: string;
  readonly created: boolean;
}

interface EnrollmentDb {
  prepare(query: string): { bind(...values: unknown[]): { first<T = unknown>(): Promise<T | null>; run(): Promise<unknown> } };
}

export async function enrollCustomer(
  db: EnrollmentDb,
  input: EnrollmentInput,
  generateId: () => string,
  now = new Date().toISOString(),
): Promise<EnrollmentResult> {
  if (!/^\d+$/.test(input.telegramUserId)) throw new Error("invalid_telegram_user_id");
  if (!input.firstName.trim()) throw new Error("first_name_required");

  const bot = await db.prepare(
    "SELECT id FROM telegram_bots WHERE active = 1 ORDER BY created_at ASC LIMIT 1",
  ).first<{ id: string }>();
  if (!bot) throw new Error("telegram_bot_not_configured");

  const existing = await db.prepare(
    "SELECT id, prime_member_id, telegram_first_name, telegram_last_name, telegram_username FROM customers WHERE bot_id = ? AND telegram_user_id = ? LIMIT 1",
  ).bind(bot.id, input.telegramUserId).first<{
    id: string;
    prime_member_id: string;
    telegram_first_name: string;
    telegram_last_name?: string;
    telegram_username?: string;
  }>();

  if (existing) {
    await db.prepare(
      "UPDATE customers SET telegram_first_name = ?, telegram_last_name = ?, telegram_username = ?, updated_at = ? WHERE id = ?",
    ).bind(input.firstName.trim(), input.lastName ?? null, input.username ?? null, now, existing.id).run();
    await db.prepare(
      "INSERT INTO customer_enrollment_events (id, customer_id, event_type, source, occurred_at, request_id) VALUES (?, ?, 'profile_refreshed', ?, ?, ?)",
    ).bind(crypto.randomUUID(), existing.id, input.source, now, input.requestId ?? null).run();
    return { customerId: existing.id, primeMemberId: existing.prime_member_id, created: false };
  }

  const customerId = crypto.randomUUID();
  const primeMemberId = generateId();
  await db.prepare(
    "INSERT INTO customers (id, bot_id, telegram_user_id, prime_member_id, telegram_first_name, telegram_last_name, telegram_username, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)",
  ).bind(customerId, bot.id, input.telegramUserId, primeMemberId, input.firstName.trim(), input.lastName ?? null, input.username ?? null, now, now).run();
  await db.prepare(
    "INSERT INTO customer_enrollment_events (id, customer_id, event_type, source, occurred_at, request_id) VALUES (?, ?, 'enrolled', ?, ?, ?)",
  ).bind(crypto.randomUUID(), customerId, input.source, now, input.requestId ?? null).run();
  return { customerId, primeMemberId, created: true };
}
