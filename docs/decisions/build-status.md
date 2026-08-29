# Build Status

## Current phase
Phase 2 — Identity, sessions, cart, and order foundation (in progress)

## Authoritative architecture
- Single PRIME deployment; no tenant model.
- Browser Admin Panel; Admin Access Code only, then server-side revocable session.
- Telegram Mini App-only storefront; protected data requires verified Telegram initData.
- Cloudflare is the production application/runtime/data platform; GitHub is source control and CI.

## Completed in repository
- Greenfield foundation and Cloudflare service boundaries.
- Telegram initData HMAC verifier with lossless Telegram User ID handling.
- Audit hash primitive.
- Single-instance forward migration removing the obsolete tenant/operator foundation and creating platform/admin/deduplication tables.
- Admin access-code verifier/session-cookie primitives.
- Explicit storefront Telegram identity guard.
- GitHub Actions CI workflow for install, typecheck, tests, and build.
- Immutable PRIME Member ID generator/validator.
- Telegram webhook secret/update-id boundary and focused coverage.
- Obsolete tenant-context source module removed.
- Commerce catalog/inventory D1 schema and contracts.
- Idempotent customer enrollment service with immutable PRIME Member ID assignment.
- Revocable customer sessions issued by Telegram exchange.
- Admin session creation/validation/revocation middleware.
- Telegram-to-customer exchange HTTP endpoint.
- Admin Access Code login HTTP endpoint.
- Core Service auth/session route wiring.
- Cart and order schema with selective cart-line checkout state and immutable order events.
- Focused PRIME Member ID and customer enrollment tests.

## Validation
- GitHub direct write path: verified.
- Existing application source import/remix: none.
- Full pnpm/typecheck/test/build execution: pending CI run.
- Production Cloudflare mutations: not performed.
- HTTP integration tests against live D1: pending connected execution runtime.

## Next vertical slice
1. Wire Telegram webhook ingestion to D1 deduplication and enrollment refresh.
2. Add server-authoritative cart operations (add/update/select/remove) with inventory checks.
3. Add catalog read API and Admin catalog mutation API.
4. Implement checkout quote/price calculation and order creation from selected cart lines.
5. Implement payment proof lifecycle and payment-review queue.
