# ADR 0003 — Admin Browser Access and Telegram-Only Storefront

## Status
Accepted

## Decision

PRIME operates as a single-instance commerce platform.

### Admin Panel
- Accessible from standard web browsers.
- Authentication uses only an Admin Access Code.
- Username/password login is not part of the platform.
- Successful verification creates a revocable server-side session.
- All admin actions are recorded in the audit trail.

### Storefront
- Storefront access is limited to the Telegram Mini App.
- Commerce APIs require verified Telegram identity.
- Browser-direct storefront access is denied.
- Cart, checkout, membership, and ordering flows require Telegram session context.

### Multi-tenancy
- Tenant concepts are removed.
- Operator tenancy is removed.
- PRIME runs as a single commerce instance.

## Consequences
- Simpler security model.
- Reduced administrative overhead.
- Clear separation between admin and customer surfaces.
- All future features must respect this boundary.