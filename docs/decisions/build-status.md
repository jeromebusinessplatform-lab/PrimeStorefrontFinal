# Build Status

## Current phase
Sprint 2 — Delivery engine completion (in progress)

## Authoritative architecture
- Single PRIME deployment; no tenant model.
- Browser Admin Panel; Admin Access Code only, then server-side revocable session.
- Admin Panel is also rendered through an Android APK shell using the same authenticated web surface.
- All UI/UX is phone-first, compact, stacked, and vertically scrollable; no horizontal-scroll configurators.
- Telegram Mini App-only storefront; protected data requires verified Telegram initData.
- Cloudflare is the production application/runtime/data platform; GitHub is source control and CI.

## Completed in repository
- Greenfield foundation and Cloudflare service boundaries.
- Telegram initData HMAC verifier with lossless Telegram User ID handling.
- Audit hash primitive.
- Single-instance migration removing the obsolete tenant/operator foundation.
- Admin access-code verifier/session-cookie primitives.
- Telegram-only storefront identity guard.
- GitHub Actions CI workflow for install, typecheck, tests, and build.
- Admin Android WebView shell and APK CI pipeline.
- Immutable PRIME Member ID generator/validator.
- Idempotent customer enrollment and Telegram-to-customer exchange foundation.
- Revocable customer sessions and Admin session lifecycle foundation.
- Commerce catalog/inventory schema and contracts.
- Cart and order foundation.
- Revised checkout state model with receiver details, Geoapify address selection, delivery provider/payment method, payment receipt storage, and independent Taggun analysis state.
- Taggun analysis is explicitly non-blocking for order submission.
- Revised order workflow with server-authoritative customer modification/cancellation locks.
- Dispatch requires a valid HTTPS tracking link; customer order actions expose TRACK only when a link is present.
- Sprint 2 warehouse and courier configurator schema in migration 0009_delivery_configurators.sql.
- Warehouse/courier validation and persistence service.
- Authenticated Admin warehouse and courier management endpoints.
- Delivery pricing changed from hard-coded rate schedules to persisted courier configuration using integer minor-unit money arithmetic.
- Delivery configurator and fee-calculation tests added/updated.
- Warehouse and courier PATCH/edit operations.
- Server-authoritative delivery quote service using the active default warehouse, selected active courier, Geoapify road routing, and persisted pricing configuration.
- Authenticated Admin delivery quote endpoint.
- Phone-first Admin Delivery Management UI for warehouse/courier listing, create, edit, and default selection.

## Validation
- GitHub direct write path: verified.
- Sprint 2 feature branch created: feat/sprint-2-delivery-engine.
- Delivery configuration TypeScript modules: statically typechecked in the local verification environment.
- Delivery migration SQL: syntax and single-default constraint validated against SQLite.
- Full pnpm/typecheck/test/build execution: pending CI run.
- Android APK assembly: workflow committed; successful Actions run pending.
- Live Geoapify/Taggun calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Sprint 2 remaining
1. Integrate the delivery quote service into customer checkout quote creation so the persisted warehouse/courier configuration is consumed by the final order quote.
2. Add end-to-end delivery quote tests covering persisted configuration, Geoapify route data, and checkout integration.
3. Run CI, fix regressions, and complete PR review/merge.

## Deferred launch backlog
- Complete commerce workflow HTTP routes and UI.
- Customer checkout UI and tracking UI.
- Coupon and referral engines.
- Loyalty modules (points, tiers, badges, store credit).
