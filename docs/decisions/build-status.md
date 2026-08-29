# Build Status

## Current phase
Sprint 2 — Delivery engine complete; Sprint 3 launch backlog next

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
- Immutable ten-character PRIME Member ID generator/validator.
- Idempotent customer enrollment and Telegram-to-customer exchange foundation.
- Revocable customer sessions and Admin session lifecycle foundation.
- Commerce catalog/inventory schema and contracts.
- Cart and order foundation.
- Revised checkout state model with receiver details, Geoapify address selection, delivery provider/payment method, payment receipt storage, and independent Taggun analysis state.
- Taggun analysis is explicitly non-blocking for order submission.
- Revised order workflow with server-authoritative customer modification/cancellation locks.
- Dispatch requires a valid HTTPS tracking link; customer order actions expose TRACK only when a link is present.
- Sprint 2 warehouse and courier configurator schema in migration 0009_delivery_configurators.sql.
- Warehouse/courier validation, persistence, update, default selection, and deactivation services.
- Authenticated Admin warehouse and courier management endpoints.
- Delivery pricing uses persisted courier configuration and integer minor-unit money arithmetic instead of hard-coded rate schedules.
- Checkout delivery quote integration resolves the persisted default warehouse, active courier, Geoapify road route, and configured fee, and persists the quote/version/expiry on the checkout session.
- Authenticated customer ownership is enforced for checkout delivery-quote mutations.
- Phone-first Admin Delivery Management UI for warehouse and courier create/edit/default operations.
- Delivery configuration, fee calculation, and checkout integration tests.
- CI workflow fixed for repositories without a committed pnpm lockfile and for the current workspace TypeScript/React/Cloudflare typings.
- Workflow coverage now enforces HTTPS tracking links during dispatch.

## Validation
- GitHub direct write path: verified.
- Sprint 2 feature branch: feat/sprint-2-delivery-engine.
- Latest full CI run for Sprint 2 passed dependency installation, TypeScript typecheck, all 24 tests, and the build.
- Final branch validation is green before merge.
- Live Geoapify/Taggun calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Sprint 2 result
Sprint 2 delivery engine is complete for the requested implementation scope.

## Remaining launch backlog
1. Complete commerce workflow HTTP routes and UI.
2. Customer checkout UI and tracking UI.
3. Coupon and referral engines.
4. Loyalty modules (points, tiers, badges, store credit).
5. Production Cloudflare configuration, secrets, domain bindings, and end-to-end live validation.
