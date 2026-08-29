export interface TelegramIdentity {
  readonly userId: string;
  readonly authDate: number;
  readonly queryId?: string;
}

export function requireTelegramIdentity(identity: TelegramIdentity | undefined): TelegramIdentity {
  if (!identity?.userId || !/^\d+$/.test(identity.userId)) {
    throw new Response(JSON.stringify({ error: "telegram_auth_required" }), {
      status: 401,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  }
  return Object.freeze({ ...identity });
}

export function assertAuthenticatedStorefrontRequest(identity: TelegramIdentity | undefined): void {
  requireTelegramIdentity(identity);
}

export function storefrontCacheControl(): string {
  return "private, no-store";
}
