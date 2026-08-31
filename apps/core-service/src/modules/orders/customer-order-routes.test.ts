import { describe, expect, it, vi } from "vitest";
import { handleCustomerOrders, handleCustomerOrderTracking } from "./customer-order-routes";

vi.mock("../identity/customer-session", () => ({
  validateCustomerSession: vi.fn(async () => null),
}));

describe("customer order routes", () => {
  it("requires Telegram session for order history", async () => {
    const db = {} as never;
    const response = await handleCustomerOrders(new Request("https://prime.example/customer/orders"), db);
    expect(response.status).toBe(401);
  });

  it("requires Telegram session for tracking", async () => {
    const db = {} as never;
    const response = await handleCustomerOrderTracking(new Request("https://prime.example/customer/orders/tracking?orderId=order-1"), db);
    expect(response.status).toBe(401);
  });
});
