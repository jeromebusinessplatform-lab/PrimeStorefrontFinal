import { describe, expect, it, vi } from "vitest";
import { applyCheckoutDeliveryQuote } from "./delivery-quote";

const warehouse = {
  id: "wh_main", name: "PRIME Main Warehouse", address: "Manila", latitude: 14.5995, longitude: 120.9842,
  is_default: 1, is_active: 1, created_at: "2026-08-30T00:00:00.000Z", updated_at: "2026-08-30T00:00:00.000Z",
};
const courier = {
  id: "co_standard", name: "Standard Courier", type: "standard", logo_object_key: null,
  base_fee_minor: 5000, per_km_rate_minor: 1500, platform_fee_minor: 500, surcharge_minor: 0,
  is_active: 1, created_at: "2026-08-30T00:00:00.000Z", updated_at: "2026-08-30T00:00:00.000Z",
};

function fakeDb() {
  const updates: unknown[][] = [];
  return {
    updates,
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              if (sql.includes("FROM checkout_sessions")) return { id: "chk_1", customer_id: "cust_1", delivery_quote_version: 2 } as T;
              if (sql.includes("FROM warehouses")) return warehouse as T;
              if (sql.includes("FROM couriers")) return courier as T;
              return null;
            },
            async all<T>() { return { results: [] as T[] }; },
            async run() { updates.push([sql, ...values]); },
          };
        },
      };
    },
  };
}

describe("checkout delivery quote integration", () => {
  it("uses persisted default warehouse + courier pricing and stores the quote on checkout", async () => {
    const db = fakeDb();
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ results: [{ distance: 12500, time: 1800 }] }), { status: 200, headers: { "content-type": "application/json" } }));
    globalThis.fetch = fetchMock as typeof fetch;
    try {
      const result = await applyCheckoutDeliveryQuote(db, {
        checkoutSessionId: "chk_1", customerId: "cust_1", courierId: "co_standard",
        latitude: 14.61, longitude: 121.02, now: new Date("2026-08-30T01:00:00.000Z"),
      }, "test-geoapify-key");
      expect(result.checkoutSessionId).toBe("chk_1");
      expect(result.quoteVersion).toBe(3);
      expect(result.warehouse.id).toBe("wh_main");
      expect(result.courier.id).toBe("co_standard");
      expect(result.route).toEqual({ distanceMeters: 12500, durationSeconds: 1800 });
      expect(result.fee.baseFeeMinor).toBe(5000);
      expect(result.fee.distanceFeeMinor).toBe(18750);
      expect(result.fee.platformFeeMinor).toBe(500);
      expect(result.fee.feeMinor).toBe(24250);
      expect(db.updates).toHaveLength(1);
      expect(db.updates[0][0]).toContain("UPDATE checkout_sessions SET delivery_warehouse_id");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally { globalThis.fetch = originalFetch; }
  });

  it("prevents one customer from quoting another customer's checkout", async () => {
    const db = fakeDb();
    await expect(applyCheckoutDeliveryQuote(db, {
      checkoutSessionId: "chk_1", customerId: "cust_other", courierId: "co_standard", latitude: 14.61, longitude: 121.02,
    }, "test-key")).rejects.toThrowError("checkout_forbidden");
  });
});
