import { describe, expect, it, vi, afterEach } from "vitest";
import { uploadReceiptToTelegram } from "./receipt-upload";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function fakeDb() {
  return {
    prepare(sql: string) {
      return {
        bind(..._values: unknown[]) {
          return {
            async first<T = unknown>(): Promise<T | null> {
              if (sql.includes("FROM checkout_sessions")) return { id: "checkout-1" } as T;
              return null;
            },
            async run(): Promise<unknown> { return { success: true }; },
          };
        },
      };
    },
  } as never;
}

describe("Telegram receipt storage", () => {
  it("stores the receipt in the configured private chat and does not block on Taggun", async () => {
    const telegramResponse = {
      ok: true,
      result: { document: { file_id: "telegram-file-123" } },
    };
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("https://api.telegram.org/botbot-token/sendDocument");
      expect(init?.method).toBe("POST");
      expect(init?.body).toBeInstanceOf(FormData);
      return new Response(JSON.stringify(telegramResponse), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;

    const file = new File(["receipt"], "receipt.jpg", { type: "image/jpeg" });
    const result = await uploadReceiptToTelegram(fakeDb(), { botToken: "bot-token", chatId: "-1001234567890" }, {
      checkoutSessionId: "checkout-1",
      customerId: "customer-1",
      file,
    });

    expect(result.objectKey).toBe("telegram://receipts/telegram-file-123");
    expect(result.receiptId).toBeTruthy();
    expect(result.taggun.status).toBe("failed");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
