# Sprint 4 Payment Boundary Decision — 2026-08-30

## Scope
Sprint 4 implements the Phase 4 payment/proof/review boundary from the PRIME master directive while preserving the server-authoritative checkout and delivery quote work already merged.

## Decisions
- Payment totals are rebuilt from the customer's active cart and persisted delivery quote. Client-submitted amounts are not accepted as authoritative.
- A payment intent is uniquely bound to one checkout session and stores an immutable quote snapshot plus selected cart-line IDs.
- Both `qr_ph` and `card_gateway` require a proof object before customer submission. Proof analysis is advisory: a deterministic pass can classify `VALIDATED`, while duplicate, mismatch, failed, inconclusive, timeout, or unavailable analysis classifies `UNVALIDATED` and routes to human review.
- Proof objects are private R2 objects and are retrieved only through authenticated application routes.
- Card gateway callbacks are accepted only with a valid HMAC signature. Provider event IDs are unique, so replay is idempotent. Amount/currency mismatches do not settle the payment intent.
- Human approval is authoritative. Card approvals additionally require an accepted, matching gateway settlement. QR approvals require proof but do not require a gateway callback.
- Customer submission creates an order in `payment_review` exactly once per payment intent and records a five-row confirmation snapshot. Replays return the existing order instead of creating a second order.
- Order numbers use tenant-local `DDMMYYHHMMSS` formatting with deterministic suffixes for same-second collisions.
- Production credentials, webhooks, DNS, and Cloudflare resources remain external configuration actions and are not mutated by this implementation branch.

## Known boundaries
The master directive contains later-phase POS, fulfillment, referral, fraud, reporting, and full customer/admin UI requirements. Those remain outside this Sprint 4 vertical slice unless separately implemented in later phases.
