# Build Status

## Current phase
Phase 1 — Security, tenancy, and platform foundation (in progress)

## Completed
- Greenfield provenance and Cloudflare-only architecture baseline.
- Root workspace configuration and separate Storefront/Admin/Core Service boundaries.
- Environment placeholder template with no secret values.
- D1 Phase 1 migration covering tenants, Telegram bots, customers/PRIME IDs, profile history, operators, sessions, and append-only audit event storage.
- Tenant context guard and explicit cross-tenant mismatch rejection primitive.
- Telegram Mini App initData HMAC verifier using Web Crypto; raw Telegram User ID digits are extracted before JSON parsing to avoid JavaScript number precision loss.
- Audit event SHA-256 hash primitive for tamper-evident chaining.

## Repository checkpoints
- `ece8f86` — Greenfield directive commit.
- `98f202a` — greenfield Cloudflare monorepo foundation.
- `a4af8be` — Phase 1 security and tenancy foundation.

## Validation
- Repository write path: verified; direct Git object/tree/commit/ref update succeeded.
- Automated TypeScript/test/build execution: NOT YET RUN inside a connected repository execution environment.
- Production Cloudflare mutations: intentionally not performed.
- Existing application source import/remix: none.

## Gate status
Phase 0 gate: NOT PASSED until a real install + baseline build/test run is executed.
Phase 1 gate: IN PROGRESS; auth/session/RBAC/audit tests and complete operator/admin security flow remain.

## Next vertical slice
Complete Phase 1 security controls:
1. Session cookie/CSRF/revocation primitives.
2. Telegram webhook secret verification + update deduplication contract.
3. PRIME Member ID generator and idempotent enrollment service.
4. Admin bootstrap-code normalization/verifier contract and RBAC permission matrix.
5. Focused security tests and request/redaction framework.
