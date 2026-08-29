import { attachProof, createOrRefreshPaymentIntent, finalizePaymentSubmission, getOrderConfirmation, recordGatewayWebhook, PAYMENT_METHODS, type PaymentMethodType } from "./payment-flow";
interface PaymentEnv { DB?: D1Database; OBJECTS?: R2Bucket; PAYMENT_GATEWAY_WEBHOOK_SECRET?: string; CARD_GATEWAY_WEBHOOK_SECRET?: string; }
interface AdminPaymentEnv extends PaymentEnv { now?: () => string; }
function jsonError(error: string, status: number): Response { return Response.json({ error }, { status, headers: { "cache-control": "no-store" } }); }
async function jsonBody(request: Request): Promise<Record<string, unknown>> { const contentType = request.headers.get("content-type") ?? ""; if (!contentType.toLowerCase().includes("application/json")) throw new Error("json_required"); const value = await request.json(); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_json"); return value as Record<string, unknown>; }
function isString(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function isMethod(value: unknown): value is PaymentMethodType { return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value); }

export async function handleCustomerPayment(request: Request, env: PaymentEnv, customerId: string): Promise<Response> {
  if (!env.DB) return jsonError("database_unavailable", 503);
  const pathname = new URL(request.url).pathname;
  try {
    if (request.method === "POST" && pathname === "/customer/checkout/payment-intent") {
      const body = await jsonBody(request);
      if (!isString(body.checkoutSessionId) || !isMethod(body.methodType)) return jsonError("invalid_payment_intent", 400);
      return Response.json(await createOrRefreshPaymentIntent(env.DB, { checkoutSessionId: body.checkoutSessionId, customerId, methodType: body.methodType }), { headers: { "cache-control": "private, no-store" } });
    }
    if (request.method === "POST" && pathname === "/customer/checkout/payment-proof") {
      if (!env.OBJECTS) return jsonError("object_storage_unavailable", 503);
      const form = await request.formData(); const paymentIntentId = form.get("paymentIntentId"); const file = form.get("file");
      if (!isString(paymentIntentId) || !(file instanceof File)) return jsonError("invalid_payment_proof", 400);
      return Response.json(await attachProof(env.DB, env.OBJECTS, { paymentIntentId, customerId, body: await file.arrayBuffer(), mediaType: file.type || "application/octet-stream" }), { status: 201, headers: { "cache-control": "private, no-store" } });
    }
    if (request.method === "POST" && pathname === "/customer/checkout/payment-submit") {
      const body = await jsonBody(request); if (!isString(body.paymentIntentId)) return jsonError("invalid_payment_submit", 400);
      return Response.json(await finalizePaymentSubmission(env.DB, { paymentIntentId: body.paymentIntentId, customerId }), { status: 201, headers: { "cache-control": "private, no-store" } });
    }
    const confirmationMatch = pathname.match(/^\/customer\/orders\/([^/]+)\/confirmation$/);
    if (request.method === "GET" && confirmationMatch) return Response.json(await getOrderConfirmation(env.DB, confirmationMatch[1], customerId), { headers: { "cache-control": "private, no-store" } });
  } catch (error) { return paymentError(error); }
  return jsonError("not_found", 404);
}

export async function handleGatewayWebhook(request: Request, env: PaymentEnv): Promise<Response> {
  const secret = env.PAYMENT_GATEWAY_WEBHOOK_SECRET ?? env.CARD_GATEWAY_WEBHOOK_SECRET;
  if (!env.DB || !secret) return jsonError("gateway_not_configured", 503);
  if (request.method !== "POST") return jsonError("method_not_allowed", 405);
  const raw = await request.text(); const signature = request.headers.get("x-prime-signature") ?? ""; const valid = await verifySignature(raw, signature, secret);
  let body: Record<string, unknown>;
  try { const parsed = JSON.parse(raw); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid_json"); body = parsed as Record<string, unknown>; } catch { return jsonError("invalid_json", 400); }
  if (!isString(body.eventId) || !isString(body.provider) || !isString(body.paymentIntentId) || typeof body.amountMinor !== "number" || !Number.isSafeInteger(body.amountMinor) || !isString(body.currency)) return jsonError("invalid_gateway_event", 400);
  const result = await recordGatewayWebhook(env.DB, { provider: body.provider, externalEventId: body.eventId, paymentIntentId: body.paymentIntentId, amountMinor: body.amountMinor, currency: body.currency, signatureValid: valid, payloadRedacted: { eventId: body.eventId, provider: body.provider, paymentIntentId: body.paymentIntentId, amountMinor: body.amountMinor, currency: body.currency } });
  if (!valid) return jsonError("invalid_gateway_signature", 401);
  return Response.json({ ok: true, result }, { headers: { "cache-control": "no-store" } });
}

export async function handleAdminPayment(request: Request, env: AdminPaymentEnv, reviewerId: string): Promise<Response> {
  if (!env.DB) return jsonError("database_unavailable", 503);
  const pathname = new URL(request.url).pathname;
  try {
    if (pathname === "/admin/payments/methods" && request.method === "GET") { const methods = await env.DB.prepare("SELECT id, method_type, label, version, qr_object_key, gateway_name, currency, is_active, created_at, updated_at FROM payment_methods ORDER BY method_type, label").all(); return Response.json({ methods: methods.results }, { headers: { "cache-control": "private, no-store" } }); }
    if (pathname === "/admin/payments/methods" && request.method === "POST") {
      const body = await jsonBody(request); if (!isString(body.id) || !isMethod(body.methodType) || !isString(body.label)) return jsonError("invalid_payment_method", 400);
      const id = body.id.trim(); const existing = await env.DB.prepare("SELECT version FROM payment_methods WHERE id = ?").bind(id).first<{ version: number }>(); const version = (existing?.version ?? 0) + 1; const now = env.now?.() ?? new Date().toISOString();
      if (existing) await env.DB.prepare("UPDATE payment_methods SET method_type = ?, label = ?, version = ?, qr_object_key = ?, gateway_name = ?, currency = ?, is_active = ?, updated_at = ? WHERE id = ?").bind(body.methodType, body.label.trim(), version, isString(body.qrObjectKey) ? body.qrObjectKey : null, isString(body.gatewayName) ? body.gatewayName : null, isString(body.currency) ? body.currency : "PHP", body.isActive === false ? 0 : 1, now, id).run();
      else await env.DB.prepare("INSERT INTO payment_methods (id, method_type, label, version, qr_object_key, gateway_name, currency, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, body.methodType, body.label.trim(), version, isString(body.qrObjectKey) ? body.qrObjectKey : null, isString(body.gatewayName) ? body.gatewayName : null, isString(body.currency) ? body.currency : "PHP", body.isActive === false ? 0 : 1, now, now).run();
      return Response.json({ id, version }, { status: existing ? 200 : 201, headers: { "cache-control": "no-store" } });
    }
    if (pathname === "/admin/payments/reviews" && request.method === "GET") { const reviews = await env.DB.prepare("SELECT pr.id, pr.payment_intent_id, pr.proof_id, pr.decision, pr.reason, pr.reviewer_id, pr.created_at, pi.customer_id, pi.method_type, pi.amount_minor, pi.currency, pi.status AS payment_status, pp.analysis_status, pp.object_key, pp.media_type, pp.size_bytes FROM payment_reviews pr JOIN payment_intents pi ON pi.id = pr.payment_intent_id LEFT JOIN payment_proofs pp ON pp.id = pr.proof_id ORDER BY pr.created_at DESC").all(); return Response.json({ reviews: reviews.results }, { headers: { "cache-control": "private, no-store" } }); }
    const reviewMatch = pathname.match(/^\/admin\/payments\/reviews\/([^/]+)\/decision$/);
    if (reviewMatch && request.method === "POST") { const body = await jsonBody(request); if (!isString(body.decision) || !["approved", "rejected", "needs_resubmission", "reconciled"].includes(body.decision)) return jsonError("invalid_review_decision", 400); return Response.json(await decideReview(env.DB, reviewMatch[1], reviewerId, body.decision as "approved" | "rejected" | "needs_resubmission" | "reconciled", isString(body.reason) ? body.reason.trim() : ""), { headers: { "cache-control": "no-store" } }); }
    const proofMatch = pathname.match(/^\/admin\/payment-proofs\/([^/]+)$/);
    if (proofMatch && request.method === "GET") { if (!env.OBJECTS) return jsonError("object_storage_unavailable", 503); const proof = await env.DB.prepare("SELECT object_key, media_type FROM payment_proofs WHERE id = ?").bind(proofMatch[1]).first<{ object_key: string; media_type: string }>(); if (!proof) return jsonError("payment_proof_not_found", 404); const object = await env.OBJECTS.get(proof.object_key); if (!object) return jsonError("payment_proof_not_found", 404); return new Response(object.body, { headers: { "cache-control": "private, no-store", "content-type": proof.media_type, "content-disposition": "inline" } }); }
  } catch (error) { return paymentError(error); }
  return jsonError("not_found", 404);
}

async function decideReview(db: D1Database, reviewId: string, reviewerId: string, decision: "approved" | "rejected" | "needs_resubmission" | "reconciled", reason: string): Promise<{ reviewId: string; decision: string }> {
  const review = await db.prepare("SELECT pr.id, pr.payment_intent_id, pi.method_type, pi.amount_minor, pi.currency, pp.id AS proof_id, pp.analysis_status FROM payment_reviews pr JOIN payment_intents pi ON pi.id = pr.payment_intent_id LEFT JOIN payment_proofs pp ON pp.id = pr.proof_id WHERE pr.id = ?").bind(reviewId).first<{ id: string; payment_intent_id: string; method_type: PaymentMethodType; amount_minor: number; currency: string; proof_id: string | null; analysis_status: string | null }>();
  if (!review) throw new Error("payment_review_not_found");
  if (decision === "approved" || decision === "reconciled") {
    if (!review.proof_id || !["validated", "unvalidated"].includes(review.analysis_status ?? "")) throw new Error("payment_proof_required");
    if (review.method_type === "card_gateway") { const settlement = await db.prepare("SELECT amount_minor, currency, signature_valid FROM payment_webhook_events WHERE payment_intent_id = ? AND status = 'accepted' ORDER BY received_at DESC LIMIT 1").bind(review.payment_intent_id).first<{ amount_minor: number; currency: string; signature_valid: number }>(); if (!settlement || settlement.signature_valid !== 1 || settlement.amount_minor !== review.amount_minor || settlement.currency !== review.currency) throw new Error("gateway_settlement_mismatch"); }
  }
  const now = new Date().toISOString();
  await db.prepare("UPDATE payment_reviews SET decision = ?, reviewer_id = ?, reason = ? WHERE id = ?").bind(decision, reviewerId, reason || null, reviewId).run();
  if (decision === "approved" || decision === "reconciled") { await db.prepare("UPDATE payment_intents SET status = 'reconciled', updated_at = ? WHERE id = ?").bind(now, review.payment_intent_id).run(); await db.prepare("UPDATE orders SET status = 'paid', updated_at = ? WHERE payment_intent_id = ? AND status = 'payment_review'").bind(now, review.payment_intent_id).run(); }
  else if (decision === "rejected") { await db.prepare("UPDATE payment_intents SET status = 'cancelled', updated_at = ? WHERE id = ?").bind(now, review.payment_intent_id).run(); await db.prepare("UPDATE orders SET status = 'cancelled', updated_at = ? WHERE payment_intent_id = ? AND status = 'payment_review'").bind(now, review.payment_intent_id).run(); }
  return { reviewId, decision };
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> { const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)); const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); return timingSafeEqual(expected, signature.toLowerCase().trim()); }
function timingSafeEqual(a: string, b: string): boolean { if (a.length !== b.length) return false; let result = 0; for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; }
function paymentError(error: unknown): Response { const message = error instanceof Error ? error.message : "payment_operation_failed"; if (["checkout_not_found", "payment_intent_not_found", "payment_review_not_found", "payment_proof_not_found", "order_not_found"].includes(message)) return jsonError(message, 404); if (["json_required", "invalid_json", "invalid_payment_intent", "invalid_payment_proof", "invalid_payment_submit", "proof_media_type_not_allowed", "proof_size_invalid", "proof_hash_invalid", "checkout_not_at_payment", "delivery_quote_required", "no_selected_cart_items", "receiver_details_required", "quote_snapshot_mismatch", "payment_proof_required", "payment_intent_not_submittable", "invalid_payment_method", "invalid_review_decision"].includes(message)) return jsonError(message, 400); if (message === "gateway_settlement_mismatch") return jsonError(message, 409); if (message === "object_storage_unavailable" || message === "database_unavailable") return jsonError(message, 503); return jsonError(message, 500); }
