# PRIME™ Telegram Enterprise Commerce

Greenfield Cloudflare-only monorepo for a Telegram Mini App storefront, separate Admin/POS application, and Core Service.

## Source of truth

`PRIME™ Telegram Enterprise Commerce Master Build Directive - ChatGPT Cloudflare.md` is the product contract.

## Architecture

- Cloudflare Workers runtime
- Workers Static Assets for application shells
- D1 for authoritative commerce data
- R2 for private objects
- Queues for asynchronous tasks
- Workflows for durable multi-step processing
- Workers AI for receipt analysis by default
- Cron Triggers for scheduled reconciliation
- GitHub for source control; Cloudflare Workers Builds for CI/CD

No existing application source was imported or remixed. See `docs/decisions/greenfield-origin.md`.

## Environments

Local, staging, and production are separate deployment/configuration targets. Secrets are supplied only through Cloudflare-managed configuration.

## Status

See `docs/decisions/build-status.md` for the current implementation phase, validation state, and next slice.
