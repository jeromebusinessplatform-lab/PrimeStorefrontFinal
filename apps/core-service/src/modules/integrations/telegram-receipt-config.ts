export interface TelegramReceiptConfig {
  botToken: string;
  chatId: string;
}

export function getTelegramReceiptConfig(env: { TELEGRAM_BOT_TOKEN?: string; TELEGRAM_RECEIPT_CHAT_ID?: string }): TelegramReceiptConfig {
  if (!env.TELEGRAM_BOT_TOKEN?.trim() || !env.TELEGRAM_RECEIPT_CHAT_ID?.trim()) throw new Error("telegram_receipt_storage_not_configured");
  return { botToken: env.TELEGRAM_BOT_TOKEN.trim(), chatId: env.TELEGRAM_RECEIPT_CHAT_ID.trim() };
}
