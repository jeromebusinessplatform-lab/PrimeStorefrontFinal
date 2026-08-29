# PRIME™ Telegram Enterprise Commerce

Greenfield Cloudflare-only monorepo for a Telegram Mini App storefront, a browser-accessible Admin/POS application, and a Core Service.

## Source of truth

`PRIME™ Telegram Enterprise Commerce Master Build Directive - ChatGPT Cloudflare.md` is the product contract.

## Architecture

- One PRIME deployment; no tenant model.
- Admin Panel is browser-accessible and requires only the Admin Access Code, followed by a revocable server-side session.
- Storefront protected data and functionality are strictly Telegram Mini App-only through server-verified Telegram initData.
- Cloudflare Workers runtime
- Workers Static Assets for application shells
- D1 for authoritative commerce data
- R2 for private objects
- Queues for asynchronous tasks
- Workflows for durable multi-step processing
- Workers AI for receipt analysis by default
- Cron Triggers for scheduled reconciliation
- GitHub for source control and CI; production runtime remains Cloudflare.

No existing application source was imported, remixed, or migrated. See `docs/decisions/greenfield-origin.md` and `docs/decisions/ADR-0001-single-instance-admin.md`.

## Environments

Local, staging, and production are separate deployment/configuration targets. Secrets are supplied only through managed configuration.

## Status

See `docs/decisions/build-status.md` for the current implementation phase and validation state.
