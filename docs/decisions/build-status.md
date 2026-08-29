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
- Authenticated Admin warehouse and courier management endpoints, including edit/update operations.
- Delivery pricing changed from hard-coded rate schedules to persisted courier configuration using integer minor-unit money arithmetic.
- Checkout delivery quote service now resolves the persisted default warehouse, active courier, Geoapify road route, and configured fee, and persists the resulting quote snapshot/linkage on the checkout session.
- Customer checkout delivery-quote route enforces authenticated customer ownership of the checkout session.
- Phone-first Admin Delivery Management UI for warehouse/courier create, edit, and default selection.
- Delivery configuration, fee calculation, and checkout integration tests.
- CI workflow hardened for repositories without a committed pnpm lockfile.

## Validation
- GitHub direct write path: verified.
- Sprint 2 feature branch: feat/sprint-2-delivery-engine.
- Delivery modules and checkout quote path statically validated through source-level tests.
- Latest GitHub CI iterations reached workspace typecheck and exposed/fixed React, Cloudflare, DOM, and test-mock typing regressions.
- Fresh full CI validation is pending against the latest branch head after the final typing fixes.
- Live Geoapify/Taggun calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Sprint 2 final gate
1. Fresh full CI run on the latest branch head.
2. Fix any remaining regression.
3. Confirm green typecheck + tests + build.
4. Merge PR #1 into main.

## Deferred launch backlog
- Complete commerce workflow HTTP routes and UI.
- Customer checkout UI and tracking UI.
- Coupon and referral engines.
- Loyalty modules (points, tiers, badges, store credit).
