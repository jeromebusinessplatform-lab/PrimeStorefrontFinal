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
- Checkout with receiver details, Geoapify address selection, delivery provider/payment method, payment receipt linkage, and independent Taggun analysis state.
- Taggun analysis is explicitly non-blocking for order submission.
- Server-authoritative customer order modification/cancellation locks.
- Dispatch requires a valid HTTPS tracking link; customer TRACK is exposed only when the order is dispatched with a tracking link.
- Sprint 2 warehouse and courier configurator schema and services.
- Delivery pricing uses persisted courier configuration and integer minor-unit money arithmetic.
- Checkout delivery quote integration resolves the persisted default warehouse, active courier, Geoapify road route, and configured fee, and persists quote/version/expiry.
- Coupon engine with fixed/percentage discounts, minimum subtotal, usage limits, validity windows, maximum discounts, normalization, and integer arithmetic.
- Referral engine with code normalization, self-referral rejection, qualification thresholds, and reward-state progression.
- Loyalty engine with points earning/redemption, lifetime points, tiers, and store-credit conversion.
- Sprint 3 persistence for coupons, redemptions, referrals, loyalty accounts, and loyalty transactions.
- Paid-order settlement with loyalty accrual, tier recalculation, atomic persistence, and database-backed idempotency.
- Referral rewards settled after payment clearance with duplicate-reward protection.
- Admin payment-confirmation routing is wired into the Worker entrypoint.
- Telegram receipt fallback is wired into the Worker upload path when R2 is unavailable; R2 remains preferred.
- Customer order history/detail/tracking reads and Admin dynamic order management are implemented and merged.

## Validation
- GitHub direct write path: verified.
- Sprint 3 closeout PR #8 merged into main.
- Launch routing PR #9 merged into main.
- Customer order/tracking PR #10 merged into main.
- Latest main commit disables `workers.dev` for the custom-domain deployment path.
- Full typecheck/tests/build had passed on the completed settlement and launch-routing validation before the latest docs/config-only change.
- Live Geoapify/Taggun/payment-provider calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Remaining launch backlog
1. Add focused end-to-end coverage spanning checkout → receipt → payment clearance → loyalty/referral/store-credit → order workflow.
2. Resolve/rebase the stale Sprint 4 payment-proof PR (#2) before treating it as a production dependency.
3. Configure production Cloudflare bindings/secrets/domain and perform live Geoapify, Taggun, Telegram, D1, receipt-storage, and payment validation.
4. Generate and verify the Admin APK release artifact.

## Release gate
The application is **not yet declared production-ready**. The core payment/receipt routing and customer order/tracking surfaces are implemented in `main`; remaining work is integration/E2E hardening, stale-branch cleanup, production Cloudflare/provider configuration, live validation, and APK release verification.
