# Build Status

## Current phase
Phase 3 — Revised checkout foundation (in progress)

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

## Validation
- GitHub direct write path: verified.
- Existing application source import/remix: none.
- Full pnpm/typecheck/test/build execution: pending CI run.
- Android APK assembly: workflow committed; successful Actions run pending.
- Live Geoapify/Taggun calls: not performed from this repository write session.
- Production Cloudflare mutations: not performed.

## Next vertical slice
1. Implement server-authoritative cart operations with inventory reservation checks.
2. Implement checkout quote/review API and order creation using the revised flow.
3. Persist receipt upload metadata and enqueue non-blocking Taggun analysis.
4. Add Geoapify autocomplete HTTP boundary for the Telegram storefront.
5. Build the compact phone-first Storefront checkout UI and stacked Admin payment/order review UI.
