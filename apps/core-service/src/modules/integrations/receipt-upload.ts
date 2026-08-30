import { analyzeReceiptWithTaggun, type TaggunAnalysis } from "./taggun-receipt";

interface ReceiptDb {
  prepare(sql: string): {
    bind(...values: unknown[]): { first<T = unknown>(): Promise<T | null>; run(): Promise<unknown> };
  };
}

export interface ReceiptUploadInput {
  checkoutSessionId: string;
  customerId: string;
  file: File;
}

export interface ReceiptUploadResult {
  receiptId: string;
  objectKey: string;
  taggun: TaggunAnalysis;
}

export interface TelegramReceiptConfig {
  botToken: string;
  chatId: string;
}

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

async function persistReceiptMetadata(db: ReceiptDb, input: ReceiptUploadInput, receiptId: string, objectKey: string, now: Date): Promise<void> {
  await db.prepare(
    "INSERT INTO payment_receipts (id, checkout_session_id, object_key, media_type, size_bytes, taggun_status, uploaded_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
  ).bind(receiptId, input.checkoutSessionId, objectKey, input.file.type, input.file.size, now.toISOString()).run();
}

async function analyzeAndPersist(db: ReceiptDb, receiptId: string, file: File, taggunApiKey?: string): Promise<TaggunAnalysis> {
  let taggun: TaggunAnalysis = { status: "failed" };
  try {
    taggun = await analyzeReceiptWithTaggun(file, taggunApiKey ?? "");
  } catch {
    taggun = { status: "failed" };
  }
  await db.prepare(
    "UPDATE payment_receipts SET taggun_status = ?, taggun_result = ?, analyzed_at = ? WHERE id = ?",
  ).bind(taggun.status, JSON.stringify(taggun), new Date().toISOString(), receiptId).run();
  return taggun;
}

function validateInput(input: ReceiptUploadInput): void {
  if (!input.checkoutSessionId.trim()) throw new Error("checkout_session_required");
  if (!input.customerId.trim()) throw new Error("customer_required");
  if (!input.file || input.file.size <= 0) throw new Error("receipt_file_required");
  if (input.file.size > MAX_RECEIPT_BYTES) throw new Error("receipt_file_too_large");
  if (!ALLOWED_TYPES.has(input.file.type)) throw new Error("receipt_file_type_invalid");
}

async function assertCheckoutOwnership(db: ReceiptDb, input: ReceiptUploadInput): Promise<void> {
  const checkout = await db.prepare(
    "SELECT id FROM checkout_sessions WHERE id = ? AND customer_id = ? AND status != 'expired' LIMIT 1",
  ).bind(input.checkoutSessionId, input.customerId).first<{ id: string }>();
  if (!checkout) throw new Error("checkout_not_found");
}

/** Stores a receipt in R2 and enriches it with Taggun analysis. */
export async function uploadReceiptToR2(
  db: ReceiptDb,
  objects: R2Bucket,
  input: ReceiptUploadInput,
  taggunApiKey?: string,
  now = new Date(),
): Promise<ReceiptUploadResult> {
  validateInput(input);
  await assertCheckoutOwnership(db, input);
  const receiptId = crypto.randomUUID();
  const extension = input.file.type === "application/pdf" ? "pdf" : input.file.type.split("/")[1] ?? "bin";
  const objectKey = `receipts/${input.customerId}/${receiptId}.${extension}`;
  await objects.put(objectKey, input.file.stream(), {
    httpMetadata: { contentType: input.file.type, cacheControl: "private, no-store" },
    customMetadata: { receiptId, checkoutSessionId: input.checkoutSessionId, customerId: input.customerId },
  });
  await persistReceiptMetadata(db, input, receiptId, objectKey, now);
  const taggun = await analyzeAndPersist(db, receiptId, input.file, taggunApiKey);
  return { receiptId, objectKey, taggun };
}

/** Stores a receipt in a private Telegram chat when R2 is unavailable, preserving mandatory receipt capture. */
export async function uploadReceiptToTelegram(
  db: ReceiptDb,
  telegram: TelegramReceiptConfig,
  input: ReceiptUploadInput,
  taggunApiKey?: string,
  now = new Date(),
): Promise<ReceiptUploadResult> {
  validateInput(input);
  await assertCheckoutOwnership(db, input);
  if (!telegram.botToken.trim() || !telegram.chatId.trim()) throw new Error("telegram_receipt_storage_not_configured");

  const form = new FormData();
  form.append("chat_id", telegram.chatId);
  form.append("document", input.file, input.file.name || `receipt-${crypto.randomUUID()}`);
  form.append("caption", `PRIME payment receipt | customer=${input.customerId} | checkout=${input.checkoutSessionId}`);

  const response = await fetch(`https://api.telegram.org/bot${telegram.botToken}/sendDocument`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw new Error("telegram_receipt_upload_failed");
  const payload = await response.json() as { ok?: boolean; result?: { document?: { file_id?: string } } };
  const fileId = payload.result?.document?.file_id;
  if (!payload.ok || !fileId) throw new Error("telegram_receipt_upload_failed");

  const receiptId = crypto.randomUUID();
  const objectKey = `telegram://receipts/${fileId}`;
  await persistReceiptMetadata(db, input, receiptId, objectKey, now);
  const taggun = await analyzeAndPersist(db, receiptId, input.file, taggunApiKey);
  return { receiptId, objectKey, taggun };
}

export function receiptUploadMustRemainNonBlockingForCheckout(): true {
  return true;
}
