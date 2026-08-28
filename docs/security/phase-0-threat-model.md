# Phase 0 Threat Model

Primary protected assets: Telegram identity, customer PII, payment proofs, payment state, inventory state, orders, tenant configuration, audit history, and private objects.

Primary controls: server-side Telegram initData verification; opaque HttpOnly Secure SameSite=Strict sessions; CSRF protection; lossless Telegram User IDs; tenant-scoped repositories; RBAC enforced in APIs; short-lived signed object access; idempotency for state-changing operations; immutable snapshots and append-only audit history; redacted logging; Cloudflare edge protections.

Non-goals for Phase 0: production credentials, DNS changes, bot webhook registration, payment activation, or production deployment.
