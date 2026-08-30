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
});
