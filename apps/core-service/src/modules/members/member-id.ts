export interface PrimeMemberIdentity {
  readonly memberId: string;
  readonly telegramUserId: string;
}

export function buildPrimeMemberId(sequence: number): string {
  const normalized = Math.max(1, Math.floor(sequence));
  return `PM-${normalized.toString().padStart(10, '0')}`;
}

export function createPrimeMemberIdentity(sequence: number, telegramUserId: string): PrimeMemberIdentity {
  if (!/^\d+$/.test(telegramUserId)) {
    throw new Error('invalid_telegram_user_id');
  }

  return Object.freeze({
    memberId: buildPrimeMemberId(sequence),
    telegramUserId,
  });
}
