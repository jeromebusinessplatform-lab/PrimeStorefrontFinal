import { analyzeReceiptWithTaggun, type TaggunAnalysis } from "./taggun-receipt";

interface ReceiptDb {
  prepare(sql: string): {
    bind(...values: unknown[]): { first<T = unknown>(): Promise<T | null>; run(): Promise<unknown> };
  };
}

export interface TelegramReceiptUploadInput {
  checkoutSessionId: string;
  customerId: string;
  file: File;
  botToken: string;
  taggunApiKey?: string;
  fetchImpl?: typeof fetch;
  now?: Date;
}

export interface TelegramReceiptUploadResult {
  receiptId: string;
  objectKey: string;
  telegramFileId: string;
  taggun: TaggunAnalysis;
}

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

type TelegramApiResponse<T> = { ok: boolean; result?: T };
type TelegramSendDocumentResult = { message_id: number; document?: { file_id: string; file_unique_id?: string; file_size?: number; mime_type?: string; file_name?: string } };
type TelegramFile = { file_id: string; file_size?: number; file_path?: string };

async function telegramJson<T>(token: string, method: string, body: unknown, fetchImpl: typeof fetch): Promise<T> {
  const response = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("telegram_api_failed");
  const payload = await response.json() as TelegramApiResponse<T>;
  if (!payload.ok || payload.result === undefined) throw new Error("telegram_api_failed");
  return payload.result;
}

export async function uploadReceiptToTelegram(
  db: ReceiptDb,
  input: TelegramReceiptUploadInput,
): Promise<TelegramReceiptUploadResult> {
  if (!input.checkoutSessionId.trim()) throw new Error("checkout_session_required");
  if (!input.customerId.trim()) throw new Error("customer_required");
  if (!input.botToken.trim()) throw new Error("telegram_bot_token_required");
  if (!input.file || input.file.size <= 0) throw new Error("receipt_file_required");
  if (input.file.size > MAX_RECEIPT_BYTES) throw new Error("receipt_file_too_large");
  if (!ALLOWED_TYPES.has(input.file.type)) throw new Error("receipt_file_type_invalid");

  const checkout = await db.prepare(
    "SELECT id FROM checkout_sessions WHERE id = ? AND customer_id = ? AND status != 'expired' LIMIT 1",
  ).bind(input.checkoutSessionId, input.customerId).first<{ id: string }>();
  if (!checkout) throw new Error("checkout_not_found");

  const customer = await db.prepare(
    "SELECT telegram_user_id FROM customers WHERE id = ? LIMIT 1",
  ).bind(input.customerId).first<{ telegram_user_id: string }>();
  if (!customer?.telegram_user_id) throw new Error("telegram_customer_not_configured");

  const fetchImpl = input.fetchImpl ?? fetch;
  const form = new FormData();
  form.set("chat_id", customer.telegram_user_id);
  form.set("document", input.file, input.file.name || "receipt");
  form.set("disable_notification", "true");
  const sendResponse = await fetchImpl(`https://api.telegram.org/bot${input.botToken}/sendDocument`, {
    method: "POST",
    body: form,
  });
  if (!sendResponse.ok) throw new Error("telegram_upload_failed");
  const sent = await sendResponse.json() as TelegramApiResponse<TelegramSendDocumentResult>;
  const telegramFileId = sent.result?.document?.file_id;
  const messageId = sent.result?.message_id;
  if (!sent.ok || !telegramFileId || !messageId) throw new Error("telegram_upload_failed");

  let fileInfo: TelegramFile;
  try {
    fileInfo = await telegramJson<TelegramFile>(input.botToken, "getFile", { file_id: telegramFileId }, fetchImpl);
  } catch (error) {
    try { await telegramJson(input.botToken, "deleteMessage", { chat_id: customer.telegram_user_id, message_id: messageId }, fetchImpl); } catch { /* best effort cleanup */ }
    throw error;
  }
  if (!fileInfo.file_path) throw new Error("telegram_file_path_missing");

  const nowIso = (input.now ?? new Date()).toISOString();
  const receiptId = crypto.randomUUID();
  const extension = input.file.type === "application/pdf" ? "pdf" : input.file.type.split("/")[1] ?? "bin";
  const objectKey = `telegram://receipts/${telegramFileId}.${extension}`;
  await db.prepare(
    "INSERT INTO payment_receipts (id, checkout_session_id, object_key, media_type, size_bytes, taggun_status, uploaded_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
  ).bind(receiptId, input.checkoutSessionId, objectKey, input.file.type, input.file.size, nowIso).run();

  let taggun: TaggunAnalysis = { status: "failed" };
  try {
    const downloadResponse = await fetchImpl(`https://api.telegram.org/file/bot${input.botToken}/${fileInfo.file_path}`);
    if (downloadResponse.ok) {
      const blob = await downloadResponse.blob();
      taggun = await analyzeReceiptWithTaggun(blob, input.taggunApiKey ?? "", fetchImpl);
    }
  } catch {
    taggun = { status: "failed" };
  }

  await db.prepare(
    "UPDATE payment_receipts SET taggun_status = ?, taggun_result = ?, analyzed_at = ? WHERE id = ?",
  ).bind(taggun.status, JSON.stringify(taggun), new Date().toISOString(), receiptId).run();

  try { await telegramJson(input.botToken, "deleteMessage", { chat_id: customer.telegram_user_id, message_id: messageId }, fetchImpl); } catch { /* best effort cleanup */ }

  return { receiptId, objectKey, telegramFileId, taggun };
}
