import coreWorker, { type Env } from "./index";
import { validateCustomerSession } from "./modules/identity/customer-session";
import { uploadReceiptToTelegram } from "./modules/integrations/telegram-receipt-upload";

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

async function resolveActiveCheckout(db: D1Database, customerId: string): Promise<string> {
  const row = await db.prepare("SELECT id FROM checkout_sessions WHERE customer_id = ? AND status != 'submitted' AND status != 'expired' ORDER BY updated_at DESC LIMIT 1").bind(customerId).first<{ id: string }>();
  if (!row) throw new Error("checkout_not_found");
  return row.id;
}

async function handleTemporaryTelegramReceipt(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return errorResponse("database_unavailable", 503);
  const session = await validateCustomerSession(env.DB, request);
  if (!session) return errorResponse("telegram_session_required", 401);
  if (!env.TELEGRAM_BOT_TOKEN) return errorResponse("telegram_auth_not_configured", 503);
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("multipart/form-data")) return errorResponse("multipart_required", 415);
  try {
    const form = await request.formData();
    const suppliedCheckoutSessionId = form.get("checkoutSessionId");
    const checkoutSessionId = typeof suppliedCheckoutSessionId === "string" && suppliedCheckoutSessionId.trim() ? suppliedCheckoutSessionId : await resolveActiveCheckout(env.DB, session.customer_id);
    const file = form.get("file");
    if (!(file instanceof File)) return errorResponse("receipt_file_required", 400);
    const result = await uploadReceiptToTelegram(env.DB, {
      checkoutSessionId,
      customerId: session.customer_id,
      file,
      botToken: env.TELEGRAM_BOT_TOKEN,
      taggunApiKey: env.TAGGUN_API_KEY,
    });
    return Response.json({ ok: true, storage: "telegram_temporary", receiptId: result.receiptId, objectKey: result.objectKey, taggun: result.taggun }, {
      status: 201,
      headers: { "cache-control": "private, no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "receipt_upload_failed";
    if (["checkout_session_required", "customer_required", "receipt_file_required", "receipt_file_too_large", "receipt_file_type_invalid", "telegram_bot_token_required"].includes(message)) return errorResponse(message, 400);
    if (["checkout_not_found"].includes(message)) return errorResponse(message, 404);
    if (["telegram_upload_failed", "telegram_api_failed", "telegram_file_path_missing"].includes(message)) return errorResponse(message, 502);
    return errorResponse(message, 500);
  }
}

async function requireReceiptBeforeSubmission(request: Request, env: Env): Promise<Response | null> {
  if (!env.DB) return errorResponse("database_unavailable", 503);
  const session = await validateCustomerSession(env.DB, request);
  if (!session) return errorResponse("telegram_session_required", 401);
  const clone = request.clone();
  let body: Record<string, unknown>;
  try { body = await clone.json() as Record<string, unknown>; } catch { return errorResponse("invalid_json", 400); }
  const checkoutSessionId = body.checkoutSessionId;
  if (typeof checkoutSessionId !== "string" || !checkoutSessionId.trim()) return errorResponse("checkout_session_required", 400);
  const receipt = await env.DB.prepare("SELECT id FROM payment_receipts WHERE checkout_session_id = ? AND order_id IS NULL ORDER BY uploaded_at DESC LIMIT 1").bind(checkoutSessionId).first<{ id: string }>();
  if (!receipt) return errorResponse("payment_receipt_required", 400);
  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/customer/catalog/receipt" && request.method === "POST") return handleTemporaryTelegramReceipt(request, env);
    if (url.pathname === "/customer/checkout/submit" && request.method === "POST") {
      const receiptError = await requireReceiptBeforeSubmission(request, env);
      if (receiptError) return receiptError;
    }
    return coreWorker.fetch(request, env, ctx);
  },
};
