# Build Status

## Current phase
Phase 2 — Commerce foundation (in progress)

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
- Commerce catalog/inventory D1 schema for categories, products, product images, inventory, and movement ledger.
- Shared commerce contracts and server-side available-inventory guard.

## Validation
- GitHub direct write path: verified.
- Existing application source import/remix: none.
- Full pnpm/typecheck/test/build execution: pending CI run.
- Production Cloudflare mutations: not performed.

## Next vertical slice
1. Add customer enrollment service backed by D1 and idempotent Telegram identity keys.
2. Wire Admin access-code verification/session lifecycle into Core Service HTTP routes.
3. Wire Telegram webhook ingestion and deduplication into Core Service routes.
4. Expose authenticated catalog reads through the Storefront boundary and Admin catalog mutation endpoints.
5. Add cart schema and server-authoritative cart operations, then move into checkout/order state.
