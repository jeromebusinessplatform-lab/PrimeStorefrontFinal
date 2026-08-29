const textEncoder = new TextEncoder();

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function verifyTelegramWebhookSecret(expected: string, provided: string | null): boolean {
  if (!expected || !provided) return false;
  return timingSafeEqual(textEncoder.encode(expected), textEncoder.encode(provided));
}

export function normalizeTelegramUpdateId(updateId: number | string): string | null {
  const value = String(updateId);
  return /^[0-9]+$/.test(value) ? value : null;
}
