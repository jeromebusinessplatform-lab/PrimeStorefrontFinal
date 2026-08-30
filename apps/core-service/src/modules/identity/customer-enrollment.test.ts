import { describe, expect, it } from "vitest";
import { enrollCustomer } from "./customer-enrollment";

function fakeDb(rows: Array<Record<string, unknown>> = [], botId = "bot-1") {
  const calls: string[] = [];
  return {
    calls,
    prepare(query: string) {
      calls.push(query);
      return {
        async first<T>() {
          if (query.startsWith("SELECT id FROM telegram_bots")) return botId ? ({ id: botId } as T) : null;
          return null;
        },
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              if (query.startsWith("SELECT id, prime_member_id")) return (rows[0] as T | undefined) ?? null;
              return null;
            },
            async run() { return { values }; },
          };
        },
      };
    },
  };
}

describe("customer enrollment", () => {
  it("creates an enrolled customer once using the active bot", async () => {
    const db = fakeDb();
    const result = await enrollCustomer(db, {
      telegramUserId: "123456789012345678",
      firstName: "Ada",
      source: "mini_app_exchange",
    }, () => "ABCD123456");

    expect(result.created).toBe(true);
    expect(result.primeMemberId).toBe("ABCD123456");
    expect(db.calls.some((call) => call.startsWith("SELECT id FROM telegram_bots"))).toBe(true);
    expect(db.calls.some((call) => call.startsWith("INSERT INTO customers"))).toBe(true);
  });

  it("returns the immutable member id for an existing Telegram identity", async () => {
    const db = fakeDb([{ id: "customer-1", prime_member_id: "ZYXW987654", telegram_first_name: "Old", telegram_last_name: null, telegram_username: null }]);
    const result = await enrollCustomer(db, {
      telegramUserId: "123456789012345678",
      firstName: "Ada",
      source: "mini_app_exchange",
    }, () => "SHOULDNOTUSE");

    expect(result.created).toBe(false);
    expect(result.customerId).toBe("customer-1");
    expect(result.primeMemberId).toBe("ZYXW987654");
  });

  it("fails when no active Telegram bot is configured", async () => {
    const db = fakeDb([], "");
    await expect(enrollCustomer(db, {
      telegramUserId: "123456789012345678",
      firstName: "Ada",
      source: "mini_app_exchange",
    }, () => "ABCD123456")).rejects.toThrow("telegram_bot_not_configured");
  });
});
