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

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function uploadReceiptToR2(
  db: ReceiptDb,
  objects: R2Bucket,
  input: ReceiptUploadInput,
  taggunApiKey?: string,
  now = new Date(),
): Promise<ReceiptUploadResult> {
  if (!input.checkoutSessionId.trim()) throw new Error("checkout_session_required");
  if (!input.customerId.trim()) throw new Error("customer_required");
  if (!input.file || input.file.size <= 0) throw new Error("receipt_file_required");
  if (input.file.size > MAX_RECEIPT_BYTES) throw new Error("receipt_file_too_large");
  if (!ALLOWED_TYPES.has(input.file.type)) throw new Error("receipt_file_type_invalid");

  const checkout = await db.prepare(
    "SELECT id FROM checkout_sessions WHERE id = ? AND customer_id = ? AND status != 'expired' LIMIT 1",
  ).bind(input.checkoutSessionId, input.customerId).first<{ id: string }>();
  if (!checkout) throw new Error("checkout_not_found");

  const receiptId = crypto.randomUUID();
  const extension = input.file.type === "application/pdf" ? "pdf" : input.file.type.split("/")[1] ?? "bin";
  const objectKey = `receipts/${input.customerId}/${receiptId}.${extension}`;

  await objects.put(objectKey, input.file.stream(), {
    httpMetadata: {
      contentType: input.file.type,
      cacheControl: "private, no-store",
    },
    customMetadata: {
      receiptId,
      checkoutSessionId: input.checkoutSessionId,
      customerId: input.customerId,
    },
  });

  const uploadedAt = now.toISOString();
  await db.prepare(
    "INSERT INTO payment_receipts (id, checkout_session_id, object_key, media_type, size_bytes, taggun_status, uploaded_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
  ).bind(receiptId, input.checkoutSessionId, objectKey, input.file.type, input.file.size, uploadedAt).run();

  let taggun: TaggunAnalysis = { status: "failed" };
  try {
    taggun = await analyzeReceiptWithTaggun(input.file, taggunApiKey ?? "");
  } catch {
    taggun = { status: "failed" };
  }

  const analyzedAt = new Date().toISOString();
  await db.prepare(
    "UPDATE payment_receipts SET taggun_status = ?, taggun_result = ?, analyzed_at = ? WHERE id = ?",
  ).bind(taggun.status, JSON.stringify(taggun), analyzedAt, receiptId).run();

  return { receiptId, objectKey, taggun };
}

export function receiptUploadMustRemainNonBlockingForCheckout(): true {
  return true;
}
