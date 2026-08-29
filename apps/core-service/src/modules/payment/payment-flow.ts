export const PAYMENT_METHODS = ["qr_ph", "card_gateway"] as const;
export type PaymentMethodType = (typeof PAYMENT_METHODS)[number];
export type ProofAnalysisStatus = "pending" | "validated" | "unvalidated" | "rejected";

const ALLOWED_PROOF_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_PROOF_BYTES = 10 * 1024 * 1024;

export interface ReceiptAnalysisInput {
  mediaType: string;
  sizeBytes: number;
  sha256: string;
  expectedAmountMinor: number;
  extractedAmountMinor?: number | null;
  providerStatus?: "ok" | "inconclusive" | "timeout" | "unavailable" | "failed";
}
export interface ReceiptAnalysisResult {
  status: Exclude<ProofAnalysisStatus, "pending">;
  reason: string;
  duplicate: boolean;
  amountMatches: boolean;
}

export function assertSafeProof(input: Pick<ReceiptAnalysisInput, "mediaType" | "sizeBytes" | "sha256">): void {
  if (!ALLOWED_PROOF_TYPES.has(input.mediaType.toLowerCase())) throw new Error("proof_media_type_not_allowed");
  if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes <= 0 || input.sizeBytes > MAX_PROOF_BYTES) throw new Error("proof_size_invalid");
  if (!/^[a-f0-9]{64}$/i.test(input.sha256)) throw new Error("proof_hash_invalid");
}
export function analyzeReceipt(input: ReceiptAnalysisInput, duplicateHash = false): ReceiptAnalysisResult {
  assertSafeProof(input);
  const duplicate = duplicateHash;
  const amountMatches = input.extractedAmountMinor == null || input.extractedAmountMinor === input.expectedAmountMinor;
  if (duplicate) return { status: "unvalidated", reason: "duplicate_proof", duplicate: true, amountMatches };
  if (!amountMatches) return { status: "unvalidated", reason: "amount_mismatch", duplicate: false, amountMatches: false };
  if (input.providerStatus && input.providerStatus !== "ok") return { status: "unvalidated", reason: `analysis_${input.providerStatus}`, duplicate: false, amountMatches };
  return { status: "validated", reason: "deterministic_precheck_passed", duplicate: false, amountMatches };
}
export function buildOrderNumber(now = new Date(), timeZone = "Asia/Manila", suffix = ""): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("day")}${get("month")}${get("year")}${get("hour")}${get("minute")}${get("second")}${suffix}`;
}
export function serializeQuoteSnapshot(input: { checkoutSessionId: string; customerId: string; currency: string; subtotalMinor: number; deliveryFeeMinor: number; discountMinor: number; totalMinor: number; selectedLineIds: string[]; deliveryQuoteVersion: number }): { json: string; fingerprint: string } {
  const snapshot = { checkoutSessionId: input.checkoutSessionId, customerId: input.customerId, currency: input.currency, subtotalMinor: input.subtotalMinor, deliveryFeeMinor: input.deliveryFeeMinor, discountMinor: input.discountMinor, totalMinor: input.totalMinor, selectedLineIds: [...input.selectedLineIds].sort(), deliveryQuoteVersion: input.deliveryQuoteVersion };
  return { json: JSON.stringify(snapshot), fingerprint: JSON.stringify(snapshot) };
}
export async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

interface CheckoutRow { id: string; customer_id: string; currency: string; delivery_fee_amount: number | null; delivery_fee_currency: string | null; delivery_courier_id: string | null; delivery_quote_version: number; status: string; }
interface CartItemRow { id: string; product_id: string; quantity: number; selected_for_checkout: number; product_price_minor: number; }

export async function createOrRefreshPaymentIntent(db: D1Database, input: { checkoutSessionId: string; customerId: string; methodType: PaymentMethodType }): Promise<{ id: string; amountMinor: number; currency: string; quoteFingerprint: string }> {
  const checkout = await db.prepare("SELECT id, customer_id, currency, delivery_fee_amount, delivery_fee_currency, delivery_courier_id, delivery_quote_version, status FROM checkout_sessions WHERE id = ? AND customer_id = ?").bind(input.checkoutSessionId, input.customerId).first<CheckoutRow>();
  if (!checkout) throw new Error("checkout_not_found");
  if (!["order_review", "payment"].includes(checkout.status)) throw new Error("checkout_not_at_payment");
  if (!checkout.delivery_courier_id) throw new Error("delivery_quote_required");
  const items = await db.prepare("SELECT ci.id, ci.product_id, ci.quantity, ci.selected_for_checkout, p.price_minor AS product_price_minor FROM cart_items ci JOIN carts c ON c.id = ci.cart_id JOIN products p ON p.id = ci.product_id WHERE c.customer_id = ? AND c.status = 'active' AND ci.selected_for_checkout = 1").bind(input.customerId).all<CartItemRow>();
  if (!items.results.length) throw new Error("no_selected_cart_items");
  const subtotalMinor = items.results.reduce((sum, item) => sum + item.quantity * item.product_price_minor, 0);
  const deliveryFeeMinor = checkout.delivery_fee_amount ?? 0;
  const currency = checkout.delivery_fee_currency ?? checkout.currency ?? "PHP";
  const totalMinor = subtotalMinor + deliveryFeeMinor;
  const selectedLineIds = items.results.map((item) => item.id);
  const { json, fingerprint } = serializeQuoteSnapshot({ checkoutSessionId: checkout.id, customerId: input.customerId, currency, subtotalMinor, deliveryFeeMinor, discountMinor: 0, totalMinor, selectedLineIds, deliveryQuoteVersion: checkout.delivery_quote_version ?? 1 });
  const existing = await db.prepare("SELECT id FROM payment_intents WHERE checkout_session_id = ?").bind(input.checkoutSessionId).first<{ id: string }>();
  const id = existing?.id ?? crypto.randomUUID();
  const now = new Date().toISOString();
  if (existing) {
    await db.prepare("UPDATE payment_intents SET method_type = ?, amount_minor = ?, currency = ?, quote_snapshot = ?, quote_fingerprint = ?, status = 'draft', updated_at = ? WHERE id = ?").bind(input.methodType, totalMinor, currency, json, fingerprint, now, id).run();
  } else {
    await db.prepare("INSERT INTO payment_intents (id, checkout_session_id, customer_id, method_type, amount_minor, currency, quote_snapshot, quote_fingerprint, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)").bind(id, checkout.id, input.customerId, input.methodType, totalMinor, currency, json, fingerprint, now, now).run();
  }
  return { id, amountMinor: totalMinor, currency, quoteFingerprint: fingerprint };
}

export async function attachProof(db: D1Database, objects: R2Bucket, input: { paymentIntentId: string; customerId: string; body: ArrayBuffer; mediaType: string }): Promise<{ proofId: string; analysis: ReceiptAnalysisResult }> {
  const intent = await db.prepare("SELECT id, amount_minor FROM payment_intents WHERE id = ? AND customer_id = ?").bind(input.paymentIntentId, input.customerId).first<{ id: string; amount_minor: number }>();
  if (!intent) throw new Error("payment_intent_not_found");
  const sha = await sha256Hex(input.body);
  const existing = await db.prepare("SELECT id FROM payment_proofs WHERE sha256 = ? LIMIT 1").bind(sha).first<{ id: string }>();
  const sizeBytes = input.body.byteLength;
  const proofId = crypto.randomUUID();
  const objectKey = `payment-proofs/${intent.id}/${proofId}`;
  const analysis = analyzeReceipt({ mediaType: input.mediaType, sizeBytes, sha256: sha, expectedAmountMinor: intent.amount_minor }, Boolean(existing));
  await objects.put(objectKey, input.body, { httpMetadata: { contentType: input.mediaType } });
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO payment_proofs (id, payment_intent_id, object_key, sha256, media_type, size_bytes, analysis_status, analysis_result, uploaded_at, analyzed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(proofId, intent.id, objectKey, sha, input.mediaType, sizeBytes, analysis.status, JSON.stringify(analysis), now, now).run();
  return { proofId, analysis };
}

export async function finalizePaymentSubmission(db: D1Database, input: { paymentIntentId: string; customerId: string }): Promise<{ orderId: string; orderNo: string; status: "payment_review"; proofStatus: ProofAnalysisStatus }> {
  const intent = await db.prepare("SELECT id, checkout_session_id, method_type, amount_minor, currency, quote_snapshot, quote_fingerprint, status FROM payment_intents WHERE id = ? AND customer_id = ?").bind(input.paymentIntentId, input.customerId).first<{ id: string; checkout_session_id: string; method_type: PaymentMethodType; amount_minor: number; currency: string; quote_snapshot: string; quote_fingerprint: string; status: string }>();
  if (!intent) throw new Error("payment_intent_not_found");
  const prior = await db.prepare("SELECT id, order_no FROM orders WHERE payment_intent_id = ?").bind(intent.id).first<{ id: string; order_no: string }>();
  if (prior) return { orderId: prior.id, orderNo: prior.order_no, status: "payment_review", proofStatus: await latestProofStatus(db, intent.id) };
  if (intent.status !== "draft") throw new Error("payment_intent_not_submittable");
  const checkout = await db.prepare("SELECT receiver_name, receiver_contact, delivery_address_text FROM checkout_sessions WHERE id = ? AND customer_id = ?").bind(intent.checkout_session_id, input.customerId).first<{ receiver_name: string | null; receiver_contact: string | null; delivery_address_text: string | null }>();
  if (!checkout?.receiver_name || !checkout.receiver_contact || !checkout.delivery_address_text) throw new Error("receiver_details_required");
  const proofStatus = await latestProofStatus(db, intent.id);
  if (proofStatus === "pending" || proofStatus === "rejected") throw new Error("payment_proof_required");
  const snapshot = JSON.parse(intent.quote_snapshot) as { subtotalMinor: number; deliveryFeeMinor: number; discountMinor: number; totalMinor: number; selectedLineIds: string[] };
  if (!Number.isSafeInteger(snapshot.totalMinor) || snapshot.totalMinor !== intent.amount_minor) throw new Error("quote_snapshot_mismatch");
  const orderId = crypto.randomUUID();
  const orderNo = await allocateOrderNumber(db);
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO orders (id, customer_id, status, currency, subtotal_minor, delivery_fee_minor, discount_minor, total_minor, created_at, updated_at, order_no, payment_intent_id, submitted_at) VALUES (?, ?, 'payment_review', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(orderId, input.customerId, intent.currency, snapshot.subtotalMinor, snapshot.deliveryFeeMinor, snapshot.discountMinor, snapshot.totalMinor, now, now, orderNo, intent.id, now).run();
  const queuePosition = (await db.prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'payment_review'").first<{ count: number }>())?.count ?? 1;
  const rows = [[1, "Order No.", orderNo], [2, "Payment Status", "ON QUEUE"], [3, "Amount", `${intent.currency} ${formatMinor(snapshot.totalMinor)}`], [4, "Proof", proofStatus.toUpperCase()], [5, "Queue Position", String(queuePosition)]] as const;
  for (const [rowOrder, label, value] of rows) await db.prepare("INSERT INTO order_confirmation_snapshots (id, order_id, row_order, label, value, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), orderId, rowOrder, label, value, now).run();
  await db.prepare("UPDATE payment_intents SET status = 'submitted', updated_at = ? WHERE id = ? AND status = 'draft'").bind(now, intent.id).run();
  await db.prepare("INSERT INTO payment_reviews (id, payment_intent_id, proof_id, decision, reason, created_at) VALUES (?, ?, (SELECT id FROM payment_proofs WHERE payment_intent_id = ? ORDER BY uploaded_at DESC LIMIT 1), 'pending', ?, ?)").bind(crypto.randomUUID(), intent.id, intent.id, proofStatus === "validated" ? "precheck_validated_human_review_required" : "precheck_unvalidated_human_review_required", now).run();
  await db.prepare("INSERT INTO order_events (id, order_id, event_type, from_status, to_status, occurred_at, actor_type, actor_id, payload_redacted) VALUES (?, ?, 'SUBMITTED_FOR_PAYMENT_REVIEW', NULL, 'payment_review', ?, 'customer', ?, ?)").bind(crypto.randomUUID(), orderId, now, input.customerId, JSON.stringify({ paymentIntentId: intent.id, proofStatus })).run();
  return { orderId, orderNo, status: "payment_review", proofStatus };
}

export async function getOrderConfirmation(db: D1Database, orderId: string, customerId: string): Promise<{ rows: Array<{ label: string; value: string }>; queuePosition: number; status: string }> {
  const order = await db.prepare("SELECT id, status FROM orders WHERE id = ? AND customer_id = ?").bind(orderId, customerId).first<{ id: string; status: string }>();
  if (!order) throw new Error("order_not_found");
  const rows = await db.prepare("SELECT label, value FROM order_confirmation_snapshots WHERE order_id = ? ORDER BY row_order").bind(orderId).all<{ label: string; value: string }>();
  const queuePosition = order.status === "payment_review" ? ((await db.prepare("SELECT COUNT(*) AS count FROM orders o WHERE o.status = 'payment_review' AND (o.created_at < (SELECT created_at FROM orders WHERE id = ?) OR (o.created_at = (SELECT created_at FROM orders WHERE id = ?) AND o.id <= ?))").bind(orderId, orderId, orderId).first<{ count: number }>())?.count ?? 0) : 0;
  return { rows: rows.results, queuePosition, status: order.status };
}

function formatMinor(value: number): string { return (value / 100).toFixed(2); }
async function latestProofStatus(db: D1Database, paymentIntentId: string): Promise<ProofAnalysisStatus> {
  const proof = await db.prepare("SELECT analysis_status FROM payment_proofs WHERE payment_intent_id = ? ORDER BY uploaded_at DESC LIMIT 1").bind(paymentIntentId).first<{ analysis_status: ProofAnalysisStatus }>();
  return proof?.analysis_status ?? "pending";
}
async function allocateOrderNumber(db: D1Database): Promise<string> {
  const base = buildOrderNumber(new Date());
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = `${base}${attempt === 0 ? "" : String(attempt).padStart(2, "0")}`;
    const found = await db.prepare("SELECT id FROM orders WHERE order_no = ?").bind(candidate).first<{ id: string }>();
    if (!found) return candidate;
  }
  throw new Error("order_number_allocation_failed");
}
export async function recordGatewayWebhook(db: D1Database, input: { provider: string; externalEventId: string; paymentIntentId: string; amountMinor: number; currency: string; signatureValid: boolean; payloadRedacted?: Record<string, unknown> }): Promise<"accepted" | "duplicate" | "rejected"> {
  const duplicate = await db.prepare("SELECT id FROM payment_webhook_events WHERE provider = ? AND external_event_id = ?").bind(input.provider, input.externalEventId).first<{ id: string }>();
  if (duplicate) return "duplicate";
  const now = new Date().toISOString();
  const status = input.signatureValid ? "accepted" : "rejected";
  await db.prepare("INSERT INTO payment_webhook_events (id, provider, external_event_id, payment_intent_id, amount_minor, currency, signature_valid, status, payload_redacted, received_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), input.provider, input.externalEventId, input.paymentIntentId, input.amountMinor, input.currency, input.signatureValid ? 1 : 0, status, JSON.stringify(input.payloadRedacted ?? {}), now).run();
  if (!input.signatureValid) return "rejected";
  const intent = await db.prepare("SELECT amount_minor, currency FROM payment_intents WHERE id = ?").bind(input.paymentIntentId).first<{ amount_minor: number; currency: string }>();
  if (!intent || intent.amount_minor !== input.amountMinor || intent.currency !== input.currency) return "accepted";
  await db.prepare("UPDATE payment_intents SET status = CASE WHEN status = 'submitted' THEN 'settled' ELSE status END, updated_at = ? WHERE id = ?").bind(now, input.paymentIntentId).run();
  return "accepted";
}
export function canFinalizeWithoutProof(methodType: PaymentMethodType): false { void methodType; return false; }
