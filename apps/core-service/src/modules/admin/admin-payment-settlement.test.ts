import { describe, expect, it, vi, afterEach } from "vitest";
import { handleAdminPaymentSettlement } from "./admin-payment-settlement";

afterEach(() => {
  vi.restoreAllMocks();
});

function dbFor(workflowState: string = "REVIEW") {
  const run = vi.fn(async () => ({ success: true, meta: { changes: 1 } }));
  const first = vi.fn(async <T,>() => ({
    id: "order-1",
    customer_id: "customer-1",
    workflow_state: workflowState,
    subtotal_minor: 1000,
    delivery_fee_minor: 100,
    discount_minor: 0,
    store_credit_minor: 0,
    currency: "PHP",
  } as T));
  return {
    prepare(sql: string) {
      return {
        bind(..._values: unknown[]) {
          return {
            first,
            run,
          };
        },
      };
    },
    batch: vi.fn(async (statements: unknown[]) => statements.map(() => ({ success: true }))),
  } as never;
}

describe("Admin payment settlement route", () => {
  it("requires Admin auth before confirming payment", async () => {
    const request = new Request("https://prime.example/admin/orders/order-1/payment-confirm", { method: "POST" });
    const response = await handleAdminPaymentSettlement(request, { DB: dbFor() });
    expect(response.status).toBe(401);
  });
});
