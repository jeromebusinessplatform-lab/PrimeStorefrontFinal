# Architecture Profile

## Runtime
Cloudflare Workers are the sole application runtime. Storefront and Admin are independently deployable Workers with same-origin API facades; Core Service contains privileged domain logic and Cloudflare bindings.

## State
D1 is the authoritative relational datastore. R2 is private object storage. Queues handle independent asynchronous tasks; Workflows handle durable multi-step processing; Cron Triggers perform scheduled reconciliation. Workers AI is the default receipt-analysis adapter.

## External integrations
Telegram, Geoapify, and one selected card-payment gateway are business integrations only. No second cloud runtime, database, object store, or queue is permitted.

## Boundaries
Authenticated tenant context is resolved server-side. Clients never choose tenant authority. Core Service is not publicly exposed when a service binding can enforce the boundary. Secrets stay in Cloudflare-managed configuration.

## Deployment
Local, staging, and production use separate Cloudflare resource namespaces as required by the directive. Workers Builds is the default CI/CD target.
