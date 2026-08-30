import { describe, expect, it } from "vitest";
import { uploadReceiptToR2 } from "./receipt-upload";

function fakeDb() {
  const calls: Array<{ sql: string; values: unknown[] }> = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              if (sql.startsWith("SELECT id FROM checkout_sessions")) return { id: "checkout-1" } as T;
              return null;
            },
            async run() { return { values }; },
          };
        },
      };
    },
  };
}

function fakeR2() {
  const uploads: Array<{ key: string; size: number }> = [];
  return {
    uploads,
    async put(key: string, body: ReadableStream<Uint8Array>) {
      const bytes = await new Response(body).arrayBuffer();
      uploads.push({ key, size: bytes.byteLength });
    },
  } as unknown as R2Bucket & { uploads: typeof uploads };
}

describe("receipt upload", () => {
  it("stores the receipt in R2 and records non-blocking Taggun analysis", async () => {
    const db = fakeDb();
    const r2 = fakeR2();
    const file = new File(["receipt"], "receipt.jpg", { type: "image/jpeg" });
    const result = await uploadReceiptToR2(db, r2, {
      checkoutSessionId: "checkout-1",
      customerId: "customer-1",
      file,
    });

    expect(result.objectKey).toMatch(/^receipts\/customer-1\/[^/]+\.jpeg$/);
    expect(r2.uploads).toHaveLength(1);
    expect(r2.uploads[0].size).toBe(7);
    expect(result.taggun.status).toBe("failed");
    expect(db.calls.some(({ sql }) => sql.startsWith("INSERT INTO payment_receipts"))).toBe(true);
  });

  it("rejects unsupported types", async () => {
    const db = fakeDb();
    const r2 = fakeR2();
    const file = new File(["x"], "receipt.txt", { type: "text/plain" });
    await expect(uploadReceiptToR2(db, r2, {
      checkoutSessionId: "checkout-1",
      customerId: "customer-1",
      file,
    })).rejects.toThrow("receipt_file_type_invalid");
    expect(r2.uploads).toHaveLength(0);
  });
});
