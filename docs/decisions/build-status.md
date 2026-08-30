# Build Status

## Current phase
<<<<<<< HEAD
Sprint 4 — Payments, proof upload, receipt analysis, and review boundary in implementation
=======
Sprint 3 — commerce workflow implementation in progress; integration/E2E and CI closeout remain
>>>>>>> origin/feat/sprint-3-commerce-workflow

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
- Revised checkout state model with receiver details, Geoapify address selection, delivery provider/payment method, payment receipt storage, and independent receipt analysis state.
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
- Workflow coverage enforces HTTPS tracking links during dispatch.

<<<<<<< HEAD
## Sprint 4 implementation in this branch
- Versioned payment-method configuration for Static QR Ph and one card-gateway adapter.
- Payment intent records bound to a server-rebuilt checkout/cart quote snapshot and selected cart lines.
- Private R2 payment-proof storage with media-type, size, hash, duplicate, mismatch, and provider-failure screening.
- VALIDATED/UNVALIDATED proof classification where analyzer failure/inconclusive/timeout/unavailable never blocks a safe final submission.
- Signed card-gateway webhook ingestion with external-event idempotency and settlement amount/currency verification.
- Customer payment submission gate requiring safe proof before an order can enter payment_review.
- Tenant-local DDMMYYHHMMSS order-number allocation with same-second collision suffixing.
- Persisted five-row confirmation snapshot and owner-authorized live confirmation endpoint.
- Authenticated Admin payment-review queue, human decision endpoint, and private evidence retrieval.
- Card approvals require matching accepted gateway settlement; QR approvals always require proof; no AI/analyzer result auto-approves or auto-bans.

## Validation
- GitHub direct write path: verified.
- Sprint 2 full CI previously completed successfully on the feature branch.
- Sprint 4 focused domain tests added; branch CI will be used for full typecheck/tests/build validation.
- Live Geoapify/payment-provider calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Sprint 4 result
Implementation slice is committed on a dedicated Sprint 4 branch and is awaiting CI validation and review.

## Remaining launch backlog
1. Complete commerce workflow HTTP routes and UI.
2. Customer checkout UI and tracking UI.
3. Coupon and referral engines.
4. Loyalty modules (points, tiers, badges, store credit).
5. Full POS/fulfillment/customer/support/fraud/reporting phases.
6. Production Cloudflare configuration, secrets, domain bindings, and end-to-end live validation.
=======
## Sprint 3 implementation in progress
- Commerce workflow composition now reuses the existing order transition contract and server-authoritative tracking requirement.
- Coupon engine supports fixed/percentage discounts, minimum subtotal, usage limits, validity windows, maximum discounts, normalization, and integer minor-unit arithmetic.
- Referral engine supports code normalization, self-referral rejection, qualification thresholds, and qualification-to-reward state progression.
- Loyalty engine supports points earning/redemption, lifetime points, tier thresholds, and store-credit conversion with safe integer validation.
- Sprint 3 persistence migration 0011_promotions_referrals_loyalty.sql adds coupons, redemptions, referrals, loyalty accounts, and loyalty transactions.
- Focused Sprint 3 tests cover checkout quote composition, tracking dispatch enforcement, coupons, referral qualification/reward, and loyalty accrual/tiering.

## Validation
- GitHub direct write path: verified.
- Sprint 2 feature branch: feat/sprint-2-delivery-engine.
- Full CI for Sprint 2 completed successfully on the feature branch: dependency installation, TypeScript typecheck, all tests, and build passed.
- Sprint 3 branch: feat/sprint-3-commerce-workflow.
- Sprint 3 CI/typecheck/test/build validation is pending on the current branch and is required before closeout.
- Live Geoapify/Taggun calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Sprint 3 closeout gate
Sprint 3 is **not complete yet**. Remaining gate: wire the new promotion/referral/loyalty capabilities into persisted checkout/order paths, add integration/E2E coverage across the full workflow, run full CI, remediate regressions, and then record the verified Sprint 3 closeout.

## Remaining launch backlog
1. Complete Sprint 3 HTTP routes/UI integration for commerce workflow and customer checkout/tracking.
2. Persist and apply coupon/referral/loyalty effects in checkout/order transactions.
3. Integration/E2E validation and full CI closeout.
4. Production Cloudflare configuration, secrets, domain bindings, and end-to-end live validation.
>>>>>>> origin/feat/sprint-3-commerce-workflow
