import { settlePayment } from "../orders/order-payment-settlement";
import { validateAdminSession } from "../security/admin-session";

interface PaymentSettlementEnv { DB?: D1Database; }

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

/** Handles the authenticated Admin action that confirms payment and clears an order. */
export async function handleAdminPaymentSettlement(request: Request, env: PaymentSettlementEnv): Promise<Response> {
  if (!env.DB) return errorResponse("database_unavailable", 503);
  const session = await validateAdminSession(env.DB, request);
  if (!session) return errorResponse("admin_auth_required", 401);
  const match = new URL(request.url).pathname.match(/^\/admin\/orders\/([^/]+)\/payment-confirm$/);
  if (!match) return errorResponse("not_found", 404);
  if (request.method !== "POST") return errorResponse("method_not_allowed", 405);
  try {
    const result = await settlePayment(env.DB, { orderId: decodeURIComponent(match[1]), actorId: session.id });
    return Response.json({ ok: true, ...result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "payment_settlement_failed";
    if (message === "order_not_found") return errorResponse(message, 404);
    if (["payment_confirmation_invalid_state", "payment_confirmation_failed"].includes(message)) return errorResponse(message, 409);
    if (message === "payment_settlement_total_invalid") return errorResponse(message, 400);
    return errorResponse(message, 500);
  }
}
