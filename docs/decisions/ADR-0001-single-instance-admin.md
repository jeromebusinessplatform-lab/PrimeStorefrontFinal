# ADR-0001: Single-Instance Admin and Telegram-Only Storefront

Status: accepted
Effective: 2026-08-29

## Decision

PRIME is implemented as one deployment rather than a multi-tenant administration platform.

The Admin Panel is reachable from any browser and requires only the Admin Access Code to authenticate. A successful code verification establishes a short-lived, revocable server-side admin session. No admin username, password, email, OAuth account, or Telegram operator identity is required.

The customer storefront remains Telegram Mini App-only. The static shell may be retrieved by a browser, but it must not expose protected catalog, pricing, cart, order, payment, customer, or other storefront functionality unless the server has verified Telegram Mini App initData and established an authenticated session.

## Consequences

- Tenant tables and tenant authorization are removed before commerce data exists.
- Admin authorization is instance-wide and therefore must be protected by rate limiting, secure session cookies, CSRF controls on mutations, reauthentication for high-risk actions, and append-only audit logging.
- Customer identity remains anchored to the lossless Telegram User ID and immutable PRIME Member ID.
- Cloudflare remains the sole production application/runtime/data platform; GitHub provides source control and CI.
