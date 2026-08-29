# Build Status

## Current phase
Phase 1 — Security and platform foundation (in progress)

## Authoritative architecture
- Single PRIME deployment; no tenant model.
- Browser Admin Panel; Admin Access Code only, then server-side revocable session.
- Telegram Mini App-only storefront; protected data requires verified Telegram initData.
- Cloudflare is the production application/runtime/data platform; GitHub is source control and CI.

## Completed in repository
- Greenfield foundation and Cloudflare service boundaries.
- Telegram initData HMAC verifier with lossless Telegram User ID handling.
- Audit hash primitive.
- Forward migration `0002_single_instance_admin.sql` removing the obsolete tenant/operator foundation and creating single-instance security tables.
- Admin access-code verifier/session-cookie primitives.
- Explicit storefront Telegram identity guard.
- GitHub Actions CI workflow for install, typecheck, tests, and build.
- Architecture override ADR.
- Focused admin access-code tests.

## Validation
- GitHub direct write path: verified.
- Existing application source import/remix: none.
- Full pnpm/typecheck/test/build execution: pending CI run.
- Production Cloudflare mutations: not performed.

## Next vertical slice
1. Wire Admin access-code verification and persistent sessions into Core Service routes.
2. Wire Telegram webhook secret verification and D1 update deduplication.
3. Implement idempotent customer enrollment and immutable PRIME Member ID assignment.
4. Add storefront Telegram exchange/session flow and browser blocking shell behavior.
5. Add focused security tests, then begin catalog/commerce schema.
