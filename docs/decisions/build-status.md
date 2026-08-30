# Build Status

## Current phase
Launch hardening after Sprint 3 settlement closeout

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
- Sprint 2 warehouse and courier configurator schema and services.
- Delivery pricing uses persisted courier configuration and integer minor-unit money arithmetic instead of hard-coded rate schedules.
- Checkout delivery quote integration resolves the persisted default warehouse, active courier, Geoapify road route, and configured fee, and persists quote/version/expiry.
- Coupon engine with fixed/percentage discounts, minimum subtotal, usage limits, validity windows, maximum discounts, normalization, and integer arithmetic.
- Referral engine with code normalization, self-referral rejection, qualification thresholds, and reward-state progression.
- Loyalty engine with points earning/redemption, lifetime points, tiers, and store-credit conversion.
- Sprint 3 persistence for coupons, redemptions, referrals, loyalty accounts, and loyalty transactions.
- Paid-order settlement with loyalty accrual, tier recalculation, atomic persistence, and database-backed idempotency.
- Referral rewards settled after payment clearance with duplicate-reward protection.
- Payment-settlement integration regression coverage.
- Telegram fallback receipt-storage service exists for launch when R2 is unavailable; R2 remains the preferred backend.

## Validation
- GitHub direct write path: verified.
- Sprint 3 closeout PR #8 merged into main.
- Sprint 3 closeout CI #261: full typecheck, tests, and build passed.
- Main settlement integration CI #268: full typecheck, tests, and build passed.
- Current main CI for Telegram fallback receipt test: running.
- Live Geoapify/Taggun calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Remaining launch backlog
1. Wire the Admin payment-confirmation route into the Worker entrypoint; the settlement service is currently in the core module layer but not exposed by the current `index.ts` routing.
2. Wire the Telegram receipt fallback into the Worker upload route so missing R2 no longer blocks mandatory receipt submission.
3. Complete customer-facing order detail/tracking route/UI coverage and verify TRACK behavior end-to-end.
4. Finish integration/E2E coverage across checkout → receipt → payment clearance → loyalty/referral/store-credit → order workflow.
5. Resolve/rebase the stale Sprint 4 payment-proof PR (#2) before using it as a production dependency.
6. Configure production Cloudflare bindings/secrets/domain and perform live Geoapify, Taggun, Telegram, D1, and receipt-storage validation.
7. Generate and verify the Admin APK release artifact.

## Release gate
The application is **not yet declared production-ready**. CI is green for the latest completed main validation, but the receipt fallback and Admin payment-action routing still need to be connected to the live Worker path, followed by end-to-end production validation.
