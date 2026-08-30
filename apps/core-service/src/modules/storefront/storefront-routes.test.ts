import { describe, expect, it } from "vitest";
import { handleCustomerCatalog, handleCustomerCouriers } from "./storefront-routes";

describe("customer storefront routes", () => {
  it("requires Telegram customer session for catalog", async () => {
    const db = { prepare: () => ({ bind: () => ({ first: async () => null }) }) } as never;
    const response = await handleCustomerCatalog(new Request("https://example.test/customer/catalog/products"), db);
    expect(response.status).toBe(401);
  });

  it("requires Telegram customer session for couriers", async () => {
    const db = { prepare: () => ({ bind: () => ({ first: async () => null }) }) } as never;
    const response = await handleCustomerCouriers(new Request("https://example.test/customer/delivery/couriers"), db);
    expect(response.status).toBe(401);
  });

  it("does not expose order detail or tracking without a Telegram session", async () => {
    const db = { prepare: () => ({ bind: () => ({ first: async () => null }) }) } as never;
    const detail = await handleCustomerCatalog(new Request("https://example.test/customer/catalog/products?view=order&orderId=order-1"), db);
    const tracking = await handleCustomerCatalog(new Request("https://example.test/customer/catalog/products?view=tracking&orderId=order-1"), db);
    expect(detail.status).toBe(401);
    expect(tracking.status).toBe(401);
  });
});
