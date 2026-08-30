import { describe, expect, it, vi } from "vitest";
import { uploadReceiptToTelegram } from "./telegram-receipt-upload";

function fakeDb() {
  const calls: Array<{ sql: string; values: unknown[] }> = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          calls.push({ sql, values });
          return {
            async first<T>() {
              if (sql.startsWith("SELECT id FROM checkout_sessions")) return { id: "checkout-1" } as T;
              if (sql.startsWith("SELECT telegram_user_id")) return { telegram_user_id: "123456789" } as T;
              return null;
            },
            async run() { return { success: true }; },
          };
        },
      };
    },
  };
}

describe("Telegram temporary receipt upload", () => {
  it("stores the Telegram file reference and enriches with Taggun", async () => {
    const db = fakeDb();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/sendDocument")) return new Response(JSON.stringify({ ok: true, result: { message_id: 44, document: { file_id: "file-1", file_size: 1000, mime_type: "image/png" } } }), { status: 200 });
      if (url.endsWith("/getFile")) return new Response(JSON.stringify({ ok: true, result: { file_id: "file-1", file_path: "documents/receipt.png", file_size: 1000 } }), { status: 200 });
      if (url.includes("/file/bot")) return new Response(new Blob(["receipt"], { type: "image/png" }), { status: 200 });
      if (url.endsWith("/deleteMessage")) return new Response(JSON.stringify({ ok: true, result: true }), { status: 200 });
      if (url.includes("api.taggun.io")) return new Response(JSON.stringify({ confidenceLevel: 0.99 }), { status: 200 });
      throw new Error(`unexpected_fetch:${url}:${init?.method ?? "GET"}`);
    });

    const result = await uploadReceiptToTelegram(db, {
      checkoutSessionId: "checkout-1",
      customerId: "customer-1",
      file: new File(["receipt"], "receipt.png", { type: "image/png" }),
      botToken: "secret",
      taggunApiKey: "taggun-secret",
      fetchImpl: fetchMock,
      now: new Date("2026-08-30T07:00:00.000Z"),
    });

    expect(result.receiptId).toBeTruthy();
    expect(result.objectKey).toBe("telegram://receipts/file-1.png");
    expect(result.telegramFileId).toBe("file-1");
    expect(result.taggun.status).toBe("analyzed");
    expect(db.calls.some((call) => call.sql.startsWith("INSERT INTO payment_receipts"))).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/deleteMessage"), expect.any(Object));
  });

  it("rejects unsupported receipt media", async () => {
    const db = fakeDb();
    await expect(uploadReceiptToTelegram(db, {
      checkoutSessionId: "checkout-1",
      customerId: "customer-1",
      file: new File(["x"], "receipt.txt", { type: "text/plain" }),
      botToken: "secret",
    })).rejects.toThrow("receipt_file_type_invalid");
  });
});
