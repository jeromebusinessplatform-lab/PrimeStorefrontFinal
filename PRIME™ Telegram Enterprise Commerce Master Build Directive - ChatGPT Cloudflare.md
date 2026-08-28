# ChatGPT + Cloudflare Master Build Directive

## Advanced Serverless Telegram E-Commerce Mini App with Admin and POS

This is a copy-paste greenfield implementation directive for ChatGPT to build and operate one production Telegram Enterprise Commerce system entirely on the Cloudflare platform. Paste the complete section beginning at “MASTER DIRECTIVE START” into a fresh ChatGPT coding/build session.

This document is the consolidated single source of truth. Use this complete version in one initial build instruction; do not paste older chat prompts/addenda beside it or ask the builder to reconcile separate requirement fragments. The phased gates control implementation order, but they do not reduce the requirement scope.

Primary run setting: ChatGPT in a coding-capable/reasoning-capable session. The directive is intentionally explicit and phase-gated so ChatGPT can work autonomously without skipping security, validation, or completion criteria. Do not silently change the active model, tool mode, or reasoning setting when the user has explicitly selected one.

There is one infrastructure profile only: Cloudflare. Do not introduce a second cloud/runtime/database/object-store/queue provider.

Before starting:

1. Start in a brand-new empty project location created specifically for this build. It must not be inside, attached to, imported from, or initialized over an existing repository, monorepo, project, application, or source tree.
2. For ChatGPT, use a new empty workspace outside every existing Git worktree. Make sure Node.js, Corepack, pnpm, and Git are available for local tooling. Cloudflare account access is required only for Cloudflare resource configuration/deployment actions.
3. Do not use any second cloud/runtime/database/object-store platform as an implementation target. Cloudflare is the sole infrastructure platform.
4. Do not paste real tokens, API keys, access codes, bank details, or customer data into chat. Add secrets only through Cloudflare’s secret/binding configuration or an equivalent Cloudflare-managed secret mechanism.
5. The application must be deploy-ready, but the coding agent must not create paid resources, alter DNS, configure the Telegram bot, push to an external repository, or deploy to production without explicit permission.

For the first coding session, use the full directive. For later sessions, keep this file in the repository and use only this compact continuation prompt to conserve context/build credits:

> Continue only the isolated greenfield Telegram Enterprise Commerce project. Read PRIME™ Telegram Enterprise Commerce Master Build Directive - ChatGPT Cloudflare.md and docs/decisions/build-status.md completely, confirm that the active project root is the recorded greenfield root and is not an existing external repository, validate the last completed phase, then resume the next incomplete vertical slice. Do not inspect, import, copy, edit, stage, commit, or delete files outside this project root. Continue autonomously, run targeted validation during the slice and the full required gate at phase completion, and update build-status.md before the final handoff.

---

# MASTER DIRECTIVE START

## 1. Role and working agreement

You are the lead product engineer, security engineer, database designer, frontend engineer, backend engineer, test engineer, and deployment engineer for one production system:

An advanced, mobile-first, serverless Telegram E-Commerce Mini App with a separate, full administration panel.

Build the working application, not a marketing page, static mockup, architecture-only proposal, or collection of disconnected sample components.

Work autonomously only inside the new greenfield project root and within the scope of this directive. This is a strict from-scratch build. Do not inspect, reuse, import, copy, patch, rename, move, delete, stage, commit, or otherwise touch any existing application code, repository, monorepo, project file, generated artifact, configuration, or source tree already present on the device, container, terminal environment, mounted drive, or connected repository.

Preflight before the first write:

1. Resolve and display the intended NEW_PROJECT_ROOT.
2. Confirm it is either nonexistent or completely empty.
3. Confirm it is outside every existing Git worktree and is not a subdirectory of another repository or monorepo.
4. If that cannot be proven, make no project files and ask the user to open/provide a new empty workspace.
5. Create the new root and initialize a new repository only inside it.
6. Record the resolved root, creation timestamp, Cloudflare-only architecture, and “created from scratch; no source imported” declaration in docs/decisions/greenfield-origin.md.
7. Treat writes outside NEW_PROJECT_ROOT as prohibited.

Reading platform documentation, runtime/tool instructions, and user-supplied specification or brand assets is allowed. Reading existing application source merely to imitate or migrate it is not allowed. Do not use GitHub import, template remix, repository cloning, package copying, or code migration. Framework-generated boilerplate from a newly invoked official scaffolder is allowed only inside the empty root.

Do not wait for another instruction after presenting a plan. Continue implementing, validating, and correcting the next in-scope slice until the task is complete or a genuine external blocker prevents progress.

Lead every major work phase with a one- or two-sentence progress update. Do not narrate routine tool calls. Do not repeatedly restate the full plan. When a non-secret product choice is missing, choose the safest simple default, record it in the decision log, and continue. Ask only when a choice would materially change security, cost, legal obligations, external integrations, or data migration.

Treat this directive as the product contract. Where two requirements appear to conflict, use this priority:

1. Security and data integrity.
2. Correct commerce and payment behavior.
3. Required user workflows.
4. Reliability and accessibility.
5. Performance.
6. Visual polish.
7. Optional convenience.

## 2. Product outcome

Deliver a production-ready and deploy-ready commerce platform that:

- Runs as a Telegram Mini App and does not expose storefront data or usable storefront functionality outside a server-authenticated Telegram session.
- Uses a separate administration application for complete store setup and operations.
- Is serverless and designed to remain available continuously without an operator-managed server.
- Persists customers, carts, checkouts, orders, payments, inventory, support records, and audit history across devices.
- Uses Telegram Mini App initData validation on the server using the documented cryptographic verification procedure.
- Enrolls a customer idempotently on the first verified private interaction with the Telegram Bot or authenticated Mini App, preserves Telegram name/handle history, and assigns one immutable 10-character PRIME Member ID tied to the stable Telegram User ID.
- Presents a compact but readable storefront with exactly three product cards per row at common mobile Telegram viewport widths.
- Keeps a compact 55px global header and a fixed 35px five-block operational subheader visible on every authenticated route, backed by live server-derived order-queue counts and duration estimates.
- Uses Geoapify-backed address autocomplete/geocoding/reverse-geocoding and road routing for a server-authoritative courier fee quote, with Metro Manila-biased suggestions that still allow nearby provinces, current-location and drop-a-pin customer flows, and an Admin-managed multi-origin registry with one active default pickup/calculation origin.
- Supports an Admin-uploaded static QR Ph payment method and one webhook-driven card gateway, while requiring a receipt/proof upload for both methods and rendering the evidence clearly for review.
- Uses a white, grey, and dark-grey global visual system, a compact proprietary-use footer on Customer and Admin routes, and a fixed six-icon customer BottomNav backed by real routes and persisted data.
- Implements server-authoritative cart, pricing, discounts, charges, delivery fees, inventory, checkout, orders, and payment state.
- Lets customers select cart lines with checkboxes for the current checkout while retaining every unchecked line in the persistent cart.
- Implements robust receipt upload, extraction, duplicate detection, mismatch analysis, tamper-risk signals, and manual review.
- Runs mandatory receipt risk analysis before final order submission without letting a pass/fail/inconclusive analyzer result block submission: a safe uploaded proof is classified as VALIDATED or UNVALIDATED, both classifications enter the same ON QUEUE payment-review workflow, and an authorized human still reviews every payment.
- Implements fraud prevention, post-event investigation, intervention, flagging, blocking, banning, and appeal/audit controls.
- Implements a complete web POS for authorized owners, administrators, and store staff to create orders on behalf of existing, new, or walk-in customers.
- Implements controlled order editing and post-confirmation amendment flows without erasing original order, payment, inventory, or delivery history.
- Implements a real referral program with tenant-scoped codes, eligibility/fraud controls, immutable order attribution, idempotent voucher-based rewards, reports, and a distinct side-by-side Promo Code/Referral Code checkout experience.
- Maintains complete, append-only, tamper-evident digital footprints for material customer, staff, admin, POS, order, payment, fraud, configuration, export, authentication, and background-job activity.
- Supports international presentation through configurable branding, currencies, locales, time zones, labels, and delivery/payment configuration.
- Is efficient to build and operate. Avoid speculative abstractions, duplicate libraries, premature microservices, and provider sprawl.

“Online 24/7” means a serverless production deployment designed for continuous access, health monitoring, recovery, and a documented availability target. Never claim literal 100% uptime. Set a production service objective of 99.9% monthly availability unless a paid provider plan and contract establish a different target.

## 3. Definition of done

The system is not complete until all of the following exist and work together:

- Storefront application.
- Admin application.
- Serverless API and background-job handlers.
- Database schema and ordered migrations.
- Private object storage for product media, payment proofs, fraud evidence, and support attachments.
- Telegram authentication exchange and revocable server-side sessions.
- Telegram Bot webhook verification, first-interaction customer enrollment, immutable PRIME Member ID generation, and append-only Telegram profile/handle history.
- Tenant isolation and role-based admin authorization.
- Product, inventory, cart, checkout, POS, order-amendment, charges, discount, voucher, courier, delivery, payment, order, customer, tier, support, reporting, receipt-analysis, fraud, and tamper-evident audit modules.
- A fully wired global order-queue monitor with exact counting rules, rolling duration metrics, data-freshness handling, responsive fixed layout, reports, and automated tests.
- Geoapify address/location workflows with 300ms Metro Manila-biased autocomplete, multi-origin/default-origin management, the constrained courier fee formula, four-column courier selector, delivery-fee payment timing and accounting, and route/quote tests.
- Static QR Ph configuration, webhook card-gateway adapter, mandatory proof lifecycle for both, and full-resolution Admin review tooling.
- Selective-cart checkout, persisted pre-order payment/proof drafts, non-blocking VALIDATED/UNVALIDATED receipt pre-screening, idempotent final submission, and the working order-confirmation queue table.
- Referral programs/codes/attribution/reward lifecycle, quote integration, Order Detail breakdown, abuse controls, and reports.
- Global white/grey theme, exact proprietary footer, fixed icon-only customer BottomNav, persisted notification inbox, responsive offsets, accessibility semantics, and route tests.
- Seed data and a safe demo tenant.
- Automated tests for critical domain behavior and security boundaries.
- End-to-end tests for the major customer and operator journeys.
- Cloudflare Workers Builds CI/CD workflow with build/test/deploy gating.
- Cloudflare staging and production deployment configuration.
- Environment-variable template with placeholders only.
- README, architecture notes, API documentation, operations runbook, backup/restore procedure, incident procedure, and deployment checklist.
- A final validation report that distinguishes passed checks, skipped checks, and external configuration still required.

Do not mark a feature complete when it is only a visual shell. A management page must read and mutate real persisted data through authenticated APIs, validate inputs, handle loading/empty/error states, enforce permissions, create audit records, and have focused tests.

## 4. Single execution profile and technical architecture

There is exactly one supported execution profile for this directive:

### Cloudflare-only production profile — ChatGPT + Cloudflare

ChatGPT is the coding/build operator. Cloudflare is the sole application infrastructure/runtime platform.

Use:

- **Edge/runtime:** Cloudflare Workers.
- **Static application assets:** Workers Static Assets.
- **Relational operational database:** Cloudflare D1.
- **Private object storage:** Cloudflare R2.
- **Asynchronous jobs:** Cloudflare Queues.
- **Durable multi-step/background workflows:** Cloudflare Workflows.
- **Scheduled work:** Workers Cron Triggers.
- **Fast ephemeral/config/cache data where appropriate:** Cloudflare KV.
- **AI inference for receipt/image analysis:** Cloudflare Workers AI as the default in-platform AI adapter.
- **Optional semantic/vector capability only when materially required:** Cloudflare Vectorize.
- **Edge security:** Cloudflare WAF, DDoS protections, API Shield where applicable, and Turnstile only where a concrete anti-abuse control requires it.
- **Admin/operator network access:** Cloudflare Access / Zero Trust may be used for internal administrative protection, but it does not replace the required Telegram identity plus Admin Access Code gate.
- **Application observability:** Cloudflare Workers Logs/Observability and Cloudflare Analytics/Analytics Engine where application metrics require durable custom measurements.
- **CI/CD:** Cloudflare Workers Builds by default. A GitHub repository may remain the source-control system, but build/deployment execution must terminate in Cloudflare.
- **Infrastructure configuration:** Wrangler and version-controlled Cloudflare configuration; use Cloudflare APIs/IaC only when needed.
- **Package manager:** pnpm through Corepack.

Cloudflare supports full-stack Workers applications with static assets, and its native Workers Builds system provides Cloudflare-integrated CI/CD for GitHub/GitLab repositories. Cloudflare Workflows provide durable multi-step execution, retries, persisted state, and human-in-the-loop pauses without an operator-managed server. citeturn185159search12turn185159search0turn185159search4

Use three independently deployable Worker applications/services that share packages:

- **Storefront Worker:** customer SPA/static assets plus same-origin storefront API facade.
- **Admin Worker:** separate admin/POS SPA/static assets plus same-origin admin API facade.
- **Core Service Worker:** domain logic, D1 access, R2 access, queue producers/consumers, Workflows, scheduled jobs, Telegram verification, provider adapters, and privileged commerce mutations.

Prefer service bindings for Worker-to-Worker calls. Do not expose the Core Service directly when a same-origin facade or internal Worker binding can enforce the intended boundary.

### Cloudflare service-boundary rules

1. **Cloudflare is the only application infrastructure provider.**
2. No Google Cloud, Firebase, AWS, Azure, Supabase, Vercel, Netlify, Render, Railway, Fly.io, managed Postgres, managed Redis, external object storage, or external job/queue runtime may be introduced.
3. Telegram, Geoapify, and the selected payment gateway are external business integrations and are explicitly allowed because they are required third-party services; all application compute, persistent commerce data, object storage, jobs, AI execution, secrets/configuration, and observability remain in Cloudflare.
4. GitHub may be used as the source-control repository because source control is not the production application runtime. Do not move application runtime, persistent data, jobs, secrets, or production observability into GitHub.
5. If an external OCR/multimodal service is retained as an optional adapter, it must remain disabled by default and the primary receipt-analysis path must run through Workers AI plus deterministic checks. Never make an external cloud runtime a dependency for core application availability.
6. Do not introduce a second operational database, second object store, or second background-processing platform.

### Recommended Cloudflare topology

```text
Telegram Mini App
      │
      ▼
Cloudflare edge / WAF / DDoS
      │
      ├── shop.example.com ──► Storefront Worker
      │                         │
      │                         └── service binding ──► Core Service Worker
      │
      └── admin.example.com ──► Admin Worker
                                │
                                └── service binding ──► Core Service Worker

Core Service Worker
  ├── D1
  ├── R2
  ├── KV (only where justified)
  ├── Queues
  ├── Workflows
  ├── Workers AI
  ├── Cron Triggers
  └── Cloudflare Observability/Analytics

External integrations used only through the Core Service:
  ├── Telegram Bot API / Mini App
  ├── Geoapify
  └── One configured card-payment gateway
```

Cloudflare Workers versions represent code/configuration deployments; storage state in D1/R2/etc. is separate state and therefore requires its own migration/recovery discipline. citeturn185159search7

### 4.1 Common application stack

- Frontend: React, TypeScript, and Vite.
- Server routing: Hono or one small equivalent selected at project creation. Do not introduce a second server framework.
- Runtime validation and shared contracts: Zod.
- Client data synchronization: TanStack Query.
- Client routing: TanStack Router or React Router, selecting one only.
- Forms: React Hook Form where forms are non-trivial; native controlled inputs for small forms.
- Styling: newly created CSS variables plus CSS Modules or one utility framework. Do not combine multiple styling systems.
- Icons: Lucide.
- Unit/integration testing: Vitest.
- Browser/end-to-end testing: Playwright.
- Cloudflare bindings/configuration: Wrangler configuration generated for the actual Worker/D1/R2/Queue/Workflow bindings used.
- AI: Workers AI behind the strict ReceiptAnalyzer interface.
- Durable background orchestration: Workflows for long or multi-step flows; Queues for independent asynchronous messages/tasks.

Resolve compatible current stable package versions once, pin them in one lockfile, and avoid floating “latest” dependencies. Do not introduce Redis, Kafka, Elasticsearch, Kubernetes, GraphQL, a second operational database, or a second object store in the initial build. Use D1 transactions/constraints, R2 authorization, Queues, Workflows, idempotency, and retries before adding coordination infrastructure.

### 4.2 Network and application boundaries

Use distinct production interfaces:

- `shop.example.com`
- `admin.example.com`
- internal Worker service bindings for the Core Service
- optional non-public operational hostnames only when a Cloudflare-supported control requires them

The static shell may be publicly retrievable because Telegram does not provide a trustworthy edge request header proving that an HTML navigation came from Telegram. Security must not depend on the User-Agent. Outside Telegram, the app may show only a blocking “Open this app in Telegram” state. It must not return customer, catalog, price, order, payment, POS, or admin data until the backend verifies Telegram initData and creates a valid session.

For Admin routes, Cloudflare Access may be used as an additional network-level layer for operator access where appropriate, but it must not replace the application’s Telegram allowlist, Admin Access Code, RBAC, recent reauthentication, or audit requirements. Cloudflare Access can be enforced before a Worker executes. citeturn185159search6

### 4.3 Greenfield monorepo shape

Create this structure inside the new empty root:

~~~text
apps/
  storefront/
  admin/
  core-service/
packages/
  contracts/
  db/
  domain/
  telegram/
  cloudflare/
  ui/
  config/
docs/
  architecture/
  api/
  operations/
  security/
  decisions/
scripts/
  seed/
  verify/
~~~

Admin includes the POS interface but keeps POS routes and permissions distinct. Keep domain rules in `packages/domain` or the core service, never in React components. Keep D1 access behind repositories/services that require an authenticated tenant context. Share schemas and public types through `packages/contracts`. Keep Cloudflare binding types/configuration explicit rather than hidden behind generic multi-provider abstractions.

## 5. Environment and configuration

Create local, staging, and production environments with separate databases, private object-storage resources, background-processing resources, session keys, Telegram bot tokens where applicable, and hostnames.

For Cloudflare, provide `.env.example`, Wrangler configuration, D1 migration definitions, R2 binding/configuration, Queue bindings, Workflow bindings, Cron schedules, Workers AI binding/configuration, and Cloudflare deployment documentation. Never include secret values. At minimum support:

- APP_ENV
- PUBLIC_APP_NAME
- PUBLIC_BRAND_NAME
- PUBLIC_DEFAULT_LOCALE
- PUBLIC_DEFAULT_CURRENCY
- PUBLIC_DEFAULT_TIMEZONE
- PUBLIC_SUPPORT_HANDLE
- TELEGRAM_BOT_TOKEN
- TELEGRAM_BOT_ID
- TELEGRAM_WEBHOOK_SECRET
- TELEGRAM_AUTH_MAX_AGE_SECONDS
- BOOTSTRAP_OWNER_TELEGRAM_ID
- ADMIN_BOOTSTRAP_CODE
- ADMIN_CODE_PEPPER
- SESSION_SIGNING_KEY_CURRENT
- SESSION_SIGNING_KEY_PREVIOUS
- FIELD_ENCRYPTION_KEY_CURRENT
- FIELD_ENCRYPTION_KEY_PREVIOUS
- RECEIPT_ANALYZER_PROVIDER
- RECEIPT_ANALYZER_API_KEY
- RECEIPT_SCREENING_MAX_WAIT_SECONDS
- GEOAPIFY_API_KEY
- PUBLIC_GEOAPIFY_MAP_KEY, optional and restricted to approved origins when client-side Geoapify tiles are used
- PAYMENT_GATEWAY_PROVIDER
- PAYMENT_GATEWAY_API_KEY
- PAYMENT_GATEWAY_WEBHOOK_SECRET
- CLOUDFLARE_LOGGING_POLICY, optional configuration metadata only

Default business configuration:

- Locale: en-PH.
- Currency: PHP.
- Time zone: Asia/Manila.
- Address search country: Philippines; preferred result region: Metro Manila/National Capital Region, while nearby Philippine provinces remain eligible.
- Admin bootstrap code: COREADMIN1991.
- Admin access-code input: non-italic, uppercase display and normalized uppercase comparison.

All business settings must be configurable per tenant. Cloudflare resource identifiers are deployment configuration, not tenant business data. Do not hard-code Philippine payment methods, couriers, addresses, or tax behavior into domain logic.

Never place the Telegram bot token, Telegram webhook secret, admin code, peppers, signing keys, encryption keys, server-side Geoapify key, payment-gateway credentials, private payment information, or other service credentials in client code, build-time public variables, migrations, fixtures committed to source control, logs, screenshots, or error payloads. A separate provider-issued browser map key may be public only when the provider intends browser exposure and it is restricted to the exact production/staging origins, allowed APIs, CORS/referrers, and quota.

### 5.1 Typography

Typography is a fixed product preference:

1. Default UI family: Roboto Condensed.
2. Approved alternative: Helvetica Neue Condensed, only when a properly licensed font asset is supplied.
3. Approved alternative: Open Sauce SF, only when the exact supplied/licensed font asset and family metadata are available.

Use Roboto Condensed as the greenfield default rather than searching another application for font files. Use non-italic styles for all operational UI. Prefer weights 400, 500, 600, and 700; do not load unused weights. Self-host optimized WOFF2 assets where licensing permits, apply font-display: swap, define a metric-compatible fallback stack, and prevent layout shift. Never download, copy, or redistribute Helvetica Neue Condensed or Open Sauce SF from an existing device/project. If those assets are not explicitly supplied, retain Roboto Condensed.

Condensed typography must improve density without harming readability. Keep customer body copy generally at 14px or larger, critical prices/actions clearly legible, POS controls readable at arm’s length, and admin tables no smaller than the tested accessibility baseline. Do not use condensed all-caps for long paragraphs.

Define `--font-size-mobile-visible-min: 11px` for tested micro-labels. The exact global proprietary footer is the only permitted exception: it uses Open Sauce SF Semibold at `calc(var(--font-size-mobile-visible-min) - 1.5px)`, which resolves to 9.5px with the default token. This is a non-interactive one-line legal notice with high contrast and text-scaling tests; do not reuse that small size elsewhere. Open Sauce SF Semibold is therefore a required production brand asset for this footer. If the licensed/supplied asset is unavailable during development, use the declared fallback only temporarily, mark the typography gate blocked, and never counterfeit or copy the font from an existing project or device.

## 6. Telegram-only authentication and sessions

Implement the official Telegram Mini App authentication pattern exactly and test it with known fixtures.

### 6.1 Client launch gate

On storefront and admin launch:

1. Load the official Telegram Mini App JavaScript bridge.
2. Call ready() after essential initialization.
3. Do not force expand() or fullscreen. Preserve compact Telegram behavior unless a future tenant setting explicitly enables expansion.
4. Read Telegram.WebApp.initData as an opaque raw string.
5. Never trust initDataUnsafe as authenticated data.
6. If initData is missing, empty, malformed, or cannot be exchanged, render the blocking Telegram-only state and do not fetch protected resources.
7. Respect Telegram theme variables, safe-area variables, content-safe-area variables, BackButton, and MainButton where they improve the workflow.

### 6.2 Server verification

Implement POST /v1/auth/telegram/exchange.

The server must:

1. Parse the raw initData query string without altering encoded values incorrectly.
2. Extract and remove the hash field before constructing the data-check string.
3. Sort the remaining fields alphabetically.
4. Join them as key=value lines separated by LF.
5. Derive secret_key as HMAC-SHA-256 with key = the literal string WebAppData and message = the Telegram bot token.
6. Compute the expected hash as HMAC-SHA-256 with key = secret_key and message = the data-check string, then encode it as lowercase hexadecimal.
7. Compare the received and expected hashes in constant time.
8. Validate auth_date against a configurable short maximum age, default five minutes, and reject timestamps materially in the future.
9. Validate required user fields and store Telegram IDs as lossless strings or safe 64-bit values, never a 32-bit integer.
10. Bind the authenticated identity to the correct tenant/bot.
11. Record rejected attempts without logging raw initData, bot tokens, full IP addresses, or personal data.

If third-party verification is later required, add Telegram’s documented Ed25519 validation as a separate adapter. Do not replace the bot-token HMAC flow without a tested reason.

### 6.3 Application sessions

After valid Telegram exchange:

- Upsert the customer/operator identity.
- Create a high-entropy opaque session token.
- Store only a cryptographic digest of the token in the database.
- Return it in an HttpOnly, Secure, SameSite=Strict cookie from the same-origin facade.
- Use short access lifetime, idle expiry, absolute expiry, rotation, revocation, and last-seen tracking.
- Do not store authentication tokens in localStorage.
- Revalidate active status on sensitive mutations.
- Use CSRF protection for state-changing requests even with same-site cookies.
- Revoke all relevant sessions on operator disablement, customer ban, access-code reset, security incident, or explicit logout.
- Support current and previous signing/encryption keys during controlled rotation.

Cross-device persistence comes from the Telegram user identity and server records, not from browser storage. A customer opening the Mini App on a different device must see the same active server cart, addresses, orders, notifications/read state, referral code/status/rewards, support tickets, and customer tier subject to privacy rules.

### 6.4 Telegram Bot first-interaction identity enrollment

The Telegram User ID—not username/handle, phone number, name, device, cookie, or PRIME Member ID—is the stable external identity anchor. Store it losslessly and key customer enrollment by `(tenant_id, bot_id, telegram_user_id)`. A renamed profile or changed/removed handle must update observed profile history and must never create a second customer.

Expose `POST /v1/webhooks/telegram/:botKey` for Telegram Bot updates. It is not a customer-session route. Verify the configured `X-Telegram-Bot-Api-Secret-Token` using constant-time comparison, accept only the expected bot/tenant mapping, enforce size/rate limits, and deduplicate `update_id` before side effects. Do not put the bot token or webhook secret in the URL. For identity enrollment, process only direct/private user interactions with the bot; do not enroll every member seen in a group/channel update.

At the first accepted bot interaction—or at the first valid Mini App authentication exchange when that happens earlier—call one shared idempotent identity service that:

1. Reads the Telegram `from.id` as a lossless string, `first_name`, optional `last_name`, and optional `username` from the verified update/session payload.
2. Finds or creates exactly one customer for the tenant/bot/Telegram User ID tuple.
3. Generates `prime_member_id` exactly once using a cryptographically secure random generator over uppercase `[A-Z0-9]`, exactly 10 characters. Enforce a deployment-wide unique constraint, retry a bounded number of times on collision, never derive it from the Telegram User ID, never recycle it, and never allow customer/operator edits.
4. Treats `PRIME Member ID` and `Internal Customer ID` as two labels for that same canonical value.
5. Updates the current Telegram profile snapshot and appends a history row only when the observed profile name or handle actually changes. Preserve prior values, observation time, trusted source (`bot_update` or `mini_app_exchange`), and safe update/session reference.
6. Emits redacted identity-created/profile-observed audit events without storing the raw update payload in routine logs.

If the bot interaction creates the customer first, a later Mini App exchange must resolve the same customer and PRIME Member ID; the reverse must also hold. Telegram profile fields are observations, not verified legal names. The bot only learns changes when Telegram sends a new interaction/update or the user authenticates again; do not claim continuous profile monitoring.

## 7. Admin access code and operator security

The admin panel is a separate application and must require both:

1. A valid Telegram-authenticated session whose Telegram ID belongs to an enabled operator for the tenant.
2. The Admin Access Code.

The access code alone must never create an operator, discover tenants, or grant admin rights.

Initial bootstrap behavior:

- Require BOOTSTRAP_OWNER_TELEGRAM_ID to be configured out of band.
- Seed no arbitrary public operator.
- The initial server secret ADMIN_BOOTSTRAP_CODE is COREADMIN1991.
- Normalize input with Unicode NFKC, trim surrounding whitespace, and uppercase before comparison.
- The input displays uppercase by default and disables autocorrect.
- Derive and compare a slow salted verifier or a securely peppered verifier on the server. Use constant-time comparison.
- Never store or return the plaintext code.
- Force the owner to replace the known bootstrap code after first successful production login. Production readiness must fail while the default code remains active.
- Keep the exact default only for initial bootstrap and test fixtures, never as an indefinite sole credential.

Apply:

- Five failed attempts per operator/session window before temporary lock.
- Escalating backoff and tenant-aware rate limiting.
- Generic error messages that do not reveal whether the Telegram ID or code was wrong.
- Full audit events for success, failure, lockout, reset, and code rotation.
- Fifteen-minute idle timeout and eight-hour absolute operator session by default.
- Recent reauthentication for owner changes, role changes, code changes, bans, unbans, exports of personal data, payment reversal, refund marking, and destructive configuration changes.

Roles:

- Owner.
- Administrator.
- Operations Manager.
- POS Supervisor.
- Cashier / Store Staff.
- Product Manager.
- Inventory Manager.
- Payment Reviewer.
- Fraud Analyst.
- Support Agent.
- Analyst.
- Read Only.

Create granular permissions and map roles to permissions. Enforce permissions in the API, not only by hiding UI. Include separate permissions for referral-program configuration, referral manual review/override, and `orders.copy_customer_pii`; ordinary order visibility must not automatically grant clipboard release. Only Owner can manage owners, security settings, access-code rotation, irreversible tenant deletion, and permanent bans. High-risk payment approvals may optionally require a second reviewer; implement this as a tenant setting, not a forced default.

## 8. Tenant and data isolation

Design as a white-label multi-tenant system even if the first deployment has one tenant.

Rules:

- Every tenant-owned D1 row has an authoritative tenant scope. R2 object keys, Queue messages, Workflow parameters/state, KV keys, and analytics aggregates must carry equivalent tenant scope.
- D1 unique constraints include tenant_id where uniqueness is tenant-scoped. Use D1 transactional unique-key rows where uniqueness matters.
- D1 foreign keys and compound unique constraints prevent cross-tenant references. Server repositories enforce tenant relationships; clients never write privileged D1/R2/Queue/Workflow state directly.
- Every authenticated request resolves one immutable TenantContext.
- Repository/service methods require TenantContext explicitly.
- No request accepts a client-provided tenant_id as authority.
- All database reads, writes, counts, exports, searches, queue messages, cache keys, object keys, audit events, and analytics aggregates are tenant-scoped.
- Private object-storage keys begin with a non-guessable tenant namespace.
- Signed upload/download URLs are short-lived and limited to one intended object and operation.
- Background jobs re-resolve and validate tenant scope before mutation.
- Admin global search never crosses tenants.
- Automated tests must attempt cross-tenant reads, writes, ID guessing, file access, exports, and queued-job replay.

Do not implement a super-admin that can silently browse every tenant. If platform administration becomes necessary later, design a separately audited break-glass role with explicit reason capture and time-limited access.

## 9. Core Domain Principles

The server is authoritative for:

- Product availability and visibility.
- SKU and variant validity.
- Prices and price versions.
- Inventory availability and reservations.
- Customer tier.
- Charges.
- Discounts, coupons, and vouchers.
- Delivery options, delivery fees, and ETA estimates.
- Payment instructions and payment state.
- Quote totals.
- Order creation and state transitions.
- Fraud holds, customer blocks, and bans.

The client may optimistically render interactions, but it must replace its state with the server response and surface conflicts clearly.

Use:

- Decimal-safe integer minor units for money. Never use binary floating point.
- ISO 4217 currency codes.
- UTC timestamps in storage and configured tenant time zones for display/report boundaries.
- Immutable quote snapshots, order-line snapshots, pricing snapshots, payment events, inventory ledger entries, and audit events.
- Idempotency keys on all create/approve/reject/dispatch/refund-like mutations.
- Optimistic concurrency versions on mutable admin records.
- Explicit state machines rather than arbitrary status writes.
- Database constraints for invariants in addition to application validation.

Keep order, payment, fulfillment, and delivery statuses separate. A payment approval must not silently imply dispatch; a delivered shipment must not rewrite the payment history.

## 10. Storefront requirements

The first usable screen is the product browsing experience, not a hero page.

### 10.1 Global fixed header and real-time order queue monitor

Create one shared compact top shell in both the authenticated customer storefront and the authenticated Admin/POS application. It must be global: every protected route uses the same shell, and route changes must not remount it or reset its last valid queue data.

Header contract:

- Set `--global-header-height: 55px`. The visible header content row is 55px high; dynamic content must never make it taller.
- Fix it to the top of the Mini App viewport with full width and an appropriate z-index. It must not move when page content scrolls.
- Keep the logo/store name, primary context, and essential actions compact. Do not add a hero, tall vertical padding, or a second toolbar inside it.
- Treat the Telegram top safe-area inset as space outside the 55px content row. Position the row below that inset rather than shrinking or obscuring it.

Directly below it, create a second fixed, non-scrolling global row:

- Set `--queue-monitor-height: 35px`.
- Position it immediately below the 55px header and safe-area inset. The combined visible content stack is approximately 90px, plus the actual top safe-area inset.
- Offset the route-level scrolling container by the computed fixed-stack height so search, page headings, dialogs, focus targets, and product cards are never hidden behind either row.
- Handle Telegram viewport changes, mobile browser keyboard changes, orientation, and safe-area updates without overlap or layout jump.
- Render a single compact five-column strip, not five large floating cards. At 320px and above use `repeat(5, minmax(0, 1fr))`, short dividers, no horizontal scrolling, and stable column widths.
- Use Roboto Condensed by default. Fit short labels at approximately 7–9px and values at approximately 11–13px after checking actual font metrics and text scaling. Permit a controlled two-line label such as `EST.` / `DISPATCH`, but never increase the 35px row.
- Every value has a fixed-size placeholder. Loading, refresh, longer numbers, and error states must not resize a block or cause cumulative layout shift.
- Preserve readable contrast in Telegram light and dark themes. Do not communicate traffic state by color alone.

The five blocks, in this exact order, are:

1. **ON QUEUE** — a whole-number count of distinct submitted active orders waiting for payment/proof review or final payment confirmation. It includes both receipt pre-screen classifications, `VALIDATED` and `UNVALIDATED`, with no automatic priority difference.
2. **PROCESSING** — a whole-number count of distinct active paid-or-fulfillment-cleared orders currently being prepared.
3. **EST. WAIT** — the server-calculated rolling average whole minutes from original order entry until the order first becomes READY.
4. **EST. DISPATCH** — the server-calculated rolling average whole minutes from the order first becoming READY until it first becomes DISPATCHED.
5. **ORDER TRAFFIC** — the exact text `LIGHT`, `MODERATE`, or `HEAVY` based on the current ON QUEUE plus PROCESSING count.

Use `READY` in this UI as the customer-facing label for the existing canonical `ready_for_dispatch` order state. Do not add a second competing READY state.

Queue scope and exclusions:

- Scope every calculation by tenant and the operational fulfillment queue relevant to the session. Use the selected store/fulfillment location when one is known; otherwise use the tenant’s configured default aggregate queue. Return the resolved non-PII scope key in metadata for diagnostics.
- Include Telegram storefront and POS orders when they consume that same preparation queue.
- Exclude demo/test data, cancelled, failed, returned, and refunded-before-preparation orders. Exclude POS counter sales explicitly configured as immediate/no-preparation.
- Count distinct order IDs, never payment-proof, payment-attempt, review, or event rows. Multiple proofs or retries for one order must not inflate the count.

Authoritative counting rules:

- `on_queue_count` includes every submitted active order whose canonical order state is `payment_review`, whether its immutable submission-time `receipt_screening_classification` is `validated` or `unvalidated`. Its payment normally remains `review_required` until authorized human review; an approved payment still awaiting the authoritative order transition remains counted through the order’s `payment_review` state.
- Do not count a checkout/payment draft, abandoned checkout, or `pending_payment` record that has not completed final order submission. A card-gateway settlement received before mandatory proof/final submission belongs in the authenticated recovery queue, not the customer-visible order queue.
- `processing_count` includes an active order in `confirmed`, `preparing`, or `packed` whose customer checkout payment is approved or whose POS tender is completed. Any authorized payment exception qualifies only after the server records the explicit policy decision `fulfillment_cleared`; never infer clearance in the browser. PAY UPON DELIVERY for the delivery fee alone does not prevent preparation once the separate checkout payment is approved.
- Do not include `ready_for_dispatch` in PROCESSING because its preparation interval has ended.
- Maintain these mappings as one versioned server domain policy used by the API, reports, Admin filters, tests, and documentation. Do not duplicate ad hoc status arrays in UI components.

Duration formulas:

- Persist the original immutable `entered_at` when the order is first accepted into the system. An edit, revision, amendment, retry, or status reversal must not reset it.
- Persist `first_ready_at` only on the first valid transition to `ready_for_dispatch` and `first_dispatched_at` only on the first valid transition to `dispatched`. Preserve later reversals and re-transitions in status history without overwriting either first timestamp.
- `estimated_wait_minutes = round(arithmetic_mean(first_ready_at - entered_at))` using valid queue-scoped orders whose first READY transition occurred in the trailing 30 days, capped to the latest 200 samples.
- `estimated_dispatch_minutes = round(arithmetic_mean(first_dispatched_at - first_ready_at))` using valid queue-scoped orders whose first DISPATCHED transition occurred in the trailing 30 days, capped to the latest 200 samples.
- Compute durations in seconds on the server, reject missing, negative, corrupt, demo/test, and unreliable migrated timestamps, calculate the mean, then round once to the nearest whole minute.
- Return each sample size. With no valid sample, return `null` and render an em dash; never show a fabricated `0 MIN`. Display a positive result as `<n> MIN`.

Traffic classification is deterministic:

- `active_load = on_queue_count + processing_count`.
- `LIGHT` when `active_load <= 5`.
- `MODERATE` when `active_load` is 6 through 10 inclusive.
- `HEAVY` when `active_load > 10`.
- Unit-test the exact boundaries 5, 6, 10, and 11.

Live-data contract:

- Add an authenticated aggregate endpoint: `GET /v1/order-queue/summary`.
- Its response contains `generated_at`, `metric_version`, non-PII `scope_key`, `on_queue_count`, `processing_count`, nullable `estimated_wait_minutes`, nullable `estimated_dispatch_minutes`, `wait_sample_size`, `dispatch_sample_size`, `active_load`, `traffic`, and `stale_after_seconds`.
- The server is authoritative. The browser must not derive counts from whatever paginated orders happen to be loaded.
- Update the aggregate idempotently from durable order/payment state-transition outbox events. Rebuild and reconcile it with an indexed scheduled job. Do not full-scan orders on every customer poll.
- While the Telegram Mini App is visible and active, refetch on a 15-second interval, with an immediate refetch after activation/focus and after a relevant successful local order/payment mutation. Pause polling while hidden or inactive. Use one shared TanStack Query key so routes do not cause duplicate requests.
- Set the default stale threshold to 45 seconds. On a transient failure, keep the last valid values and show a subtle accessible stale indicator. If no valid response has ever loaded, show em dashes—not false zeroes—and provide a retry path.
- No WebSocket, Durable Object, or extra real-time provider is required for the first release. The event-maintained aggregate plus bounded active polling is the simple serverless baseline; add a push channel only after measured need.
- Treat the estimates as operational guidance, not a promise. Provide a compact accessible description such as “Live estimate based on the current queue and recent completed orders.”
- Keep the strip display-only so its 35px height does not create undersized touch targets. In Admin/POS, provide a separate accessible `View queue` action that opens the permission-checked queue dashboard with payment-review and preparation filters; do not turn the five narrow display cells into the only navigation path.
- Do not put order IDs, names, Telegram identities, payment references, or other personal data in the summary response, browser telemetry, or public cache. Do not audit every 15-second read; audit queue-policy/configuration changes, material metric repair, and failed/recovered aggregation jobs.

This feature is incomplete if it shows hard-coded demo values, counts client-loaded rows, uses unversioned status mappings, lacks stale/error behavior, or is not connected to real order and payment transitions.

### 10.2 Storefront navigation

Use a light-first white storefront with grey and slightly dark-grey dividers, borders, secondary text, and navigation surfaces. Reserve saturated semantic colors for success, warning, danger, information, selected focus, and status communication. Do not add gradients, glass effects, tinted page backgrounds, or unnecessary shadows to the default tenant theme.

Create a fixed bottom shell that is mounted once with the authenticated application shell and remains stable across route changes:

- Add `--global-footer-height: 18px`. The global footer is fixed at the bottom on every authenticated Customer, Admin, and POS route, above or including the device bottom safe-area treatment as appropriate.
- Render this exact one-line text with no substitution, wrapping, clipping, ellipsis, marquee, or extra copyright text: `SYSTEM USAGE IS PROPRIETARY. DO NOT DISTRIBUTE OR COPY.`
- Use the required supplied/licensed Open Sauce SF Semibold face and the 9.5px default footer size defined in Section 5.1. Use a white background, dark-grey text, a subtle top divider, centered alignment, stable line height, and sufficient horizontal fit at 320px.
- The notice is non-interactive and must not be announced repeatedly during route changes. It may use `aria-label` with normal sentence casing if that improves screen-reader pronunciation without changing the visible text.
- Admin and POS routes show this footer without the customer BottomNav. Their scrolling containers reserve the footer height plus bottom safe area.

On every authenticated customer route, mount a Global BottomNav immediately above the footer:

- Set `--customer-bottom-nav-height: 44px`. This is the minimum compact height because every tab must retain at least a 44px touch target; do not reduce it by creating inaccessible targets.
- Use exactly six equal-width tabs in this order: SHOP, CART, ORDERS, NOTIFICATION, ACCOUNT, SUPPORT.
- Render only one consistent outline/filled-state icon per tab. Do not show visible text labels. Supply the full tab name through accessible name/visually hidden text, use `aria-current="page"` on the active destination, and provide a visible keyboard focus state.
- Use these real route contracts: SHOP → `/shop`; CART → `/cart`; ORDERS → `/orders`; NOTIFICATION → `/notifications`; ACCOUNT → `/account`; SUPPORT → `/support`.
- SHOP opens the product browse/search/category state. CART reads the server-backed cart and may show its real item-count badge. ORDERS opens paginated customer order history and details. NOTIFICATION opens the persisted customer notification inbox and may show its real unread-count badge. ACCOUNT opens profile, saved addresses, consent, and privacy actions. SUPPORT opens the customer’s persisted tickets and conversation history.
- Derive active state from the router, including nested routes; never maintain a separate tab state that can disagree with the URL. Preserve relevant scroll/query state when returning to SHOP.
- Badge values come from authenticated aggregate endpoints, cap visual display at `99+`, have accessible names, and never use hard-coded demo counts in production.
- Keep the white base, grey separators, dark-grey default icons, and a restrained configured accent or near-black active icon. Avoid labels, oversized center actions, floating navigation, and animated icon gimmicks.
- Customer route content reserves `44px + 18px + bottom safe-area inset`; focus targets, checkout actions, toasts, sheets, and Telegram MainButton behavior must not be hidden by the nav/footer stack.
- When a mobile keyboard opens, use the stable/visual viewport to keep the focused field and primary action visible. Do not duplicate or unpredictably jump the navigation. If Telegram MainButton is used for checkout, coordinate the content inset so it does not cover the BottomNav or footer.

Back the NOTIFICATION route with a real tenant/customer-scoped inbox, not only outbound bot-send logs. Store notification type, title/body or template snapshot, related-record authorization reference, created time, read time, and expiry/archive state. Keep Telegram Bot delivery as a separate channel outcome; a failed bot message must not remove the in-app notification.

Preserve scroll position when returning from product details. Integrate Telegram BackButton. Use Telegram MainButton for the clearest primary checkout action without duplicating a large on-screen button unnecessarily.

### 10.3 Product grid

At viewport widths from 320px through 599px:

- Render exactly three equal product columns.
- Use minmax(0, 1fr), 6–8px gaps, and 8–12px page gutters.
- Use square or consistent 4:5 product media.
- Keep cards at 8px corner radius or less.
- Product name: two-line clamp, legible non-italic font, minimum approximately 11px depending on selected font metrics.
- Price: visually stronger than secondary metadata, minimum approximately 12px.
- Optional compare-at price must remain readable and not crowd the card.
- Stock/availability uses a short badge or semantic indicator.
- The add control uses a familiar plus/cart icon with an accessible label.
- Once added, show compact quantity stepper behavior without causing grid reflow.
- Tapping the body opens product details; tapping add does not.
- Use optimized image sizes and lazy loading below the first visible rows.

At larger Telegram desktop/tablet widths, allow four to six columns only if the cards remain within the same design system. The mobile three-column layout is the acceptance-critical layout.

### 10.4 Search and filters

- Sticky compact search field at the top of the scrolling content, offset below the fixed global header and queue strip.
- Small filter/sort control beside it.
- Debounced search with cancellation.
- Category chips or a compact category sheet.
- Filter by category, availability, price range, and tenant-configured attributes.
- Sort by featured, newest, price ascending, price descending, and name.
- Filters are reflected in the URL/router state where safe.
- Show result count and a clear-filter action.
- Empty results explain which filters are active.

### 10.5 Product details

Include:

- Media gallery.
- Name, variant, price, compare-at price, availability.
- Concise description.
- Variant selection.
- Quantity with per-order constraints.
- Estimated delivery information when calculable.
- Configurable notices.
- Add-to-cart control.
- Related products only when backed by actual configuration; do not invent recommendations.

### 10.6 Customer account

Persist:

- Read-only current Telegram Profile Name.
- Read-only current Telegram Handle, with a safe “No handle” state.
- Read-only lossless Telegram User ID.
- Read-only immutable 10-character PRIME Member ID / Internal Customer ID.
- Append-only Telegram profile-name and handle history for authorized fraud investigation; do not expose unnecessary history in the normal customer UI.
- Customer-entered full name.
- Validated phone number.
- Email if enabled and optional.
- Saved addresses.
- Delivery notes.
- Consent timestamps and policy version.
- Customer tier and tier history.
- Referral code, qualified/pending referral summary, and issued reward vouchers without referred-customer PII.
- Order and support history.

Do not overwrite customer-entered legal/delivery information merely because the Telegram profile changes. Keep a clear distinction between Telegram profile fields and customer-provided checkout fields.

## 11. Product management

Implement a real admin product system:

- Categories and nested category ordering with a sensible maximum depth.
- Products and variants.
- Stable internal IDs and unique tenant-scoped SKUs.
- Product slug, status, title, short description, full description, tags, attributes, and search keywords.
- Media upload, ordering, alt text, crop/focal metadata, and safe deletion checks.
- Base price, compare-at price, optional cost visible only to authorized roles, currency, and effective dates.
- Variant options such as size, color, weight, or package.
- Unit display and approximate volume/quantity text as configurable content, not commerce math.
- Stock policy: tracked, untracked, allow backorder, or stop at zero.
- Minimum order quantity, maximum order quantity, and increment.
- Visibility: draft, active, scheduled, archived.
- Featured ordering.
- Per-channel visibility for future expansion while Telegram remains the first channel.
- SEO fields may exist for future use but must not create a public storefront outside Telegram.
- Duplicate product action.
- Bulk status/category/price operations with preview and audit.
- Import/export CSV with validation report, dry-run mode, and no partial silent corruption.
- Price history and change audit.

Deletion defaults to archive. Prevent destructive deletion when a product or variant is referenced by an order, payment, inventory ledger entry, report, or fraud case.

## 12. Inventory management

Implement:

- Inventory locations.
- Stock on hand.
- Reserved stock.
- Available stock derived as on hand minus valid reservations.
- Reorder point and low-stock status.
- Inventory ledger with reason codes.
- Receipts, adjustments, reservations, releases, sales, cancellations, returns, damage, and reconciliation entries.
- Tenant-scoped SKU search and filtering.
- Low-stock dashboard and export.
- Inventory history per variant and location.
- Admin adjustment requiring reason and permission.
- Optional negative-stock prohibition, enabled by default.

Checkout reservation:

- Reserve inventory only after the server accepts a valid checkout quote or reaches the configured checkout stage.
- Give reservations an expiry, default fifteen minutes.
- Release expired, cancelled, or failed-checkout reservations idempotently.
- Revalidate stock atomically before order creation.
- Do not decrement stock twice when queue messages retry.
- When stock changed, return a structured conflict and an updated cart/quote.

## 13. Cart and checkout

### 13.1 Server-backed cart

- One active cart per tenant/customer/channel by default.
- Persist across devices.
- Add, update, remove, and clear endpoints.
- Render a checkbox for every eligible cart line plus compact `SELECT ALL`/`CLEAR SELECTION` controls. Persist each line’s `selected_for_checkout` state server-side so the same selection is restored across devices.
- Require at least one selected, currently eligible line to start/refresh checkout. Only selected line IDs and their current cart version enter the checkout snapshot, quote, inventory reservation, and final order.
- Successful order commit removes only the purchased selected lines. Retain unchecked lines, their quantities, and their selection state in the same active cart; never clear/close the whole cart when unchecked items remain.
- Merge duplicate line variants.
- Enforce quantity rules.
- Return normalized lines, availability, subtotal estimate, warnings, and cart version.
- Do not treat the cart subtotal as a final payable quote.
- Use optimistic concurrency or a cart version to prevent lost updates.

### 13.2 Checkout session

Use this exact customer progression and numbering. It is one resumable server-backed checkout, not twelve disconnected pages:

1. **1.0 CUSTOMER DETAILS** — show four read-only values from the authenticated customer record: `Telegram Profile Name`, `Telegram Handle`, `Telegram User ID`, and `PRIME Member ID`. PRIME Member ID is the Internal Customer ID defined in Section 6.4. Never let a client submit substitute identity values.
2. **1.1 MY SHOPPING CART** — show the persistent cart checkboxes. Checkout only checked eligible items while unchecked items remain in the cart after the order commits. Any selected-line/cart-version change invalidates the quote and downstream payment draft.
3. **2.0 DELIVERY DETAILS** — require `Receiver Name` and `Receiver Contact No.` as equal-width side-by-side fields using `repeat(2, minmax(0, 1fr))`; use appropriate autocomplete, normalization, and server validation. Add `Address Lookup` using the Geoapify flow and exact 300ms debounce in Section 16.2. Add one textarea labeled exactly `FLOOR/UNIT NO./INSTRUCTIONS`, sized to three visible text lines (`rows=3` plus a stable three-line minimum block height) and included in the confirmed address snapshot. On very narrow text-scaling/accessibility failure only, allow the two receiver fields to stack rather than clip.
4. **3.0 COURIER SELECTION** — use the strict four-tile selector and the quote origin active at that moment.
5. **4.0 DELIVERY FEE PAYMENT OPTION** — require `PAY AT CHECKOUT` or `PAY UPON DELIVERY` as defined in Section 16.4.
6. **5.0 CHARGES** — show every applicable named charge and zero/none state; no hidden charge.
7. **6.0 DISCOUNTS/VOUCHERS** — show applied automatic/tier benefits and the separate equal-width PROMO CODE and REFERRAL CODE controls below.
8. **7.0 FINAL BILL** — render the immutable server quote and fully reconciled product subtotal, discounts, charges, delivery components, amount due at checkout, amount due upon delivery, and order grand total before payment starts.
9. **8.0 PAYMENT METHOD** — choose either the configured Static QR Ph method or configured card gateway and create/reuse the server-side checkout payment draft against the still-valid quote.
10. **8.1 UPLOAD PAYMENT PROOF** — require one safe receipt/proof upload for either method. A gateway webhook does not waive this requirement.
11. **8.2 RECEIPT RISK ANALYSIS** — start/resume the persisted bounded analysis pipeline against the payment draft; show honest progress and never present it as guaranteed forgery detection.
12. **8.3 ANALYSIS RESULT** — show `VALIDATED` only when the defined pre-screen passes; otherwise show `UNVALIDATED` with a neutral explanation that Admin review is still required. Pass, fail, inconclusive, timeout, unavailable external analyzer, or later manual review does not remove the proof or strand checkout.
13. **9.0 ORDER SUBMISSION** — enable final submission after a safe mandatory proof is persisted and the analysis has reached a stored result. Both VALIDATED and UNVALIDATED are allowed to submit; both create an order in `payment_review` and enter ON QUEUE.

Persist the checkout session so a customer can continue on another device until it expires. Never persist plaintext secrets or raw payment credentials.

File-security validation is distinct from receipt-risk scoring: malicious, unsupported, MIME/magic-mismatched, oversized, or otherwise unsafe content is not an acceptable proof and must be replaced. After a safe proof is accepted, an adverse or unavailable analyzer result must never disable final order submission. Preserve inventory reservation through the configured bounded analysis window, extend it safely/idempotently when policy permits, and show a requote/re-reserve conflict rather than silently changing totals.

In the discount/referral area, render exactly two optional equal-width fields side by side at customer mobile widths:

- Use `grid-template-columns: repeat(2, minmax(0, 1fr))` with a compact 6–8px gap; do not stack one above the other in the acceptance viewports.
- Left field label and accessible name: `PROMO CODE`.
- Right field label and accessible name: `REFERRAL CODE`.
- Keep input/control heights, label positions, internal padding, validation space, and total field length visually equal. Use compact explicit Apply/clear behavior without allowing either control to push or resize the other.
- Both are optional and independently validated by the server. Normalize with Unicode NFKC, trim, and uppercase for lookup; preserve only the safe normalized snapshot required for order history.
- A promo code invokes the discount/coupon engine. A referral code invokes the referral domain in Section 15A. Do not treat them as interchangeable aliases, allow one to overwrite the other, or submit either as trusted client pricing.
- Show applied/invalid/expired/ineligible/already-used/self-referral states beside the correct field without changing the two-column geometry. Any code change invalidates the current quote and requires server recomputation.

### 13.3 Quote snapshot

The server creates an immutable versioned quote containing:

- Customer, immutable PRIME Member ID, and tier context relevant to pricing; snapshot current Telegram profile facts separately from receiver/delivery facts.
- Selected cart-line IDs, cart version, and checkout selection digest. Unselected cart lines are not quoted or reserved.
- Product and variant snapshots.
- Quantities.
- Unit prices and line totals.
- Automatic discounts.
- Coupon/voucher effects.
- Applied promo redemption and discount amount.
- Referral attribution, referred-customer benefit if any, referral-program/version ID, initial provisional status, and reward-policy snapshot without exposing referrer PII to the customer.
- Charges and their rule IDs.
- Receiver name/contact and complete delivery-address snapshot including `FLOOR/UNIT NO./INSTRUCTIONS`; selected coordinates; immutable delivery-origin ID/name/coordinate/version; route destination; Geoapify road distance in meters; route profile; route-response timestamp/digest; courier/service; fee-config version; and itemized delivery-fee components.
- Delivery-fee payment timing: `pay_at_checkout` or `pay_upon_delivery`.
- Tax only if explicitly configured.
- Currency.
- Merchandise/payment amount due at checkout, delivery amount due upon delivery, and full order grand total as separate values that reconcile exactly.
- Inventory reservation IDs.
- Quote version and expiry.
- A deterministic quote integrity digest.

Order creation must reference a valid quote snapshot and an idempotency key. Recalculate/revalidate on the server. If anything material changed, do not silently charge or create a different order; present the customer with the updated quote and require confirmation.

The visible bill breakdown must separately label product subtotal, discounts, charges, each applied delivery-fee component, total delivery fee, its selected payment timing, amount due at checkout, amount due upon delivery, and order grand total. If `pay_upon_delivery` is selected, do not include the delivery fee in the amount expected on the checkout payment proof; retain it in the grand total and create a separately tracked delivery-fee collection obligation. If `pay_at_checkout` is selected, include it in the expected proof/gateway amount. Changing the address, pin, courier, service, fee-payment timing, or applicable night window invalidates the prior quote and requires a new server quote.

### 13.4 Checkout payment draft, final order creation, and confirmation

Before final order creation, persist one tenant/customer/checkout-scoped `checkout_payment_draft` bound to the immutable quote, selected method, expected `amount_due_at_checkout`, currency, payment intent/attempt, gateway settlement facts when applicable, safe proof, and analysis runs. The browser never invents IDs, storage paths, extracted facts, risk classification, amount, or settlement status. Reuse the same valid draft idempotently after refresh/cross-device resume; invalidate it when the quote or selected cart lines materially change.

The final `POST /v1/orders` receives the checkout/payment-draft reference plus an idempotency key. In one transaction or recoverable outbox-backed unit:

1. Reauthenticate and revalidate tenant/customer, checkout version, quote expiry/digest, selected lines, inventory reservation, customer restrictions, mandatory safe proof, and payment-draft ownership.
2. Freeze the latest completed submission pre-screen result: `validated` only for a defined passing run; map fail, mismatch, high risk, duplicate risk, inconclusive, timeout, invalid analyzer schema, or unavailable provider to `unvalidated`. Display these canonical values as `VALIDATED` and `UNVALIDATED`.
3. Create the order in canonical state `payment_review` regardless of that classification. Keep the payment in `review_required`; human payment/order review remains mandatory for both. For card, preserve the independent provider-settlement state and do not approve until the verified webhook/reconciliation rule permits it.
4. Link—not copy loosely—the payment intent/attempt, proof, analysis history, and provider events to the new order while preserving their original timestamps and immutable hashes. A settled gateway draft that never reaches final submission must remain in an Admin recovery workflow and must never be silently deleted.
5. Snapshot order lines, customer identity/PRIME Member ID, receiver/delivery facts, applied rules, route/default-origin version, proof-classification reason/version, and totals.
6. Consume/rescope selected inventory reservations, redeem applicable benefits, append order/payment/status history, emit queue/outbox events idempotently, and remove only the purchased selected cart lines. Retain unchecked cart lines.

Generate an internal UUID/ULID as the authoritative identity and a tenant-scoped human Order No. whose base is the tenant-local submission timestamp formatted exactly `DDMMYYHHmmss` (displayed to the owner as `DDMMYYHHMMSS`). Enforce uniqueness. If two orders for the same tenant commit within the same second, keep the exact 12-digit base for the first and append the smallest deterministic `-NN` collision suffix to later orders; never overwrite or conflate orders. Persist the true UTC submission timestamp independently.

After a successful commit, render a compact confirmation surface with a small CSS/SVG animated check. Honor `prefers-reduced-motion` by showing the final check without motion; do not add an animation library. Show the Order No. with a visually small copy icon whose actual focus/touch target remains at least 44px, an accessible `Copy order number` label, secure Clipboard API use, and a selection fallback.

Render this exact compact two-column confirmation table, using server-returned values:

| Label | Value contract |
| --- | --- |
| `Queue Position:` | 1-based position among distinct submitted ON QUEUE orders in the same tenant/operational scope, ordered by immutable `entered_at`, then internal order ID as the deterministic tie-breaker. Include both VALIDATED and UNVALIDATED; expose no other order/customer identifiers. |
| `Est. Waiting Time (mins.):` | Reuse the queue summary’s current nullable `estimated_wait_minutes`; do not multiply it by position or calculate it in the browser. Render an em dash when unavailable. |
| `Order Date & Time:` | Tenant-local formatted `entered_at`, while the API also supplies the canonical UTC timestamp. |
| `Order No.` | The generated human Order No. above. |
| `Order Amount` | Full order grand total and currency; due-now/due-later remain visible in the preceding/following bill breakdown. |

Persist the submission-time position/estimate/order values as an immutable confirmation snapshot and return them from `GET /v1/orders/:id/confirmation`. While the order remains ON QUEUE, `GET /v1/orders/:id/queue-status` may refresh the current position/estimate through the same shared 15-second query cadence; when it leaves ON QUEUE, replace the position with the current customer-safe status rather than displaying a misleading queue number. Repeated final submissions with the same idempotency key return the same order, number, and confirmation result.

## 13A. Full point-of-sale system

Build a complete POS inside the separate Admin application under a dedicated /pos route and permission boundary. It must let an authorized Owner, Administrator, POS Supervisor, Cashier, or Store Staff member place an order on behalf of a customer while using the same catalog, pricing, rules, inventory, customer, quote, payment, order, and audit services as the Telegram storefront. Do not create a second simplified commerce engine for POS.

### 13A.1 POS operating model

Support:

- Stores/branches.
- Registers.
- Inventory location assigned to each register.
- Operator shifts.
- Opening cash float.
- Cash-in and cash-out movements with reason and approval policy.
- Expected-versus-counted closing cash.
- Variance reason and supervisor acknowledgement.
- X report for current shift and Z/closing report for completed shift.
- Register/shift lock so an unauthorized operator cannot transact under another operator’s session.

POS order source must be recorded as pos with store, register, shift, and operator identity. Storefront orders remain source telegram_storefront. Reports must be able to separate or combine channels without changing accounting totals.

### 13A.2 POS sale screen

Provide a compact, touch-friendly, keyboard-accessible interface for mobile, tablet, and desktop Telegram clients:

- Fast product/SKU/category search.
- Optional barcode input through a keyboard-wedge scanner and camera adapter when supported.
- Three-column compact product mode on narrow screens and denser configurable grid/list modes on larger screens.
- Product/variant selection, stock at the active location, quantity controls, and clear unavailable state.
- Customer lookup by authorized identifiers.
- Create a new customer with consent, choose an existing customer, or use a walk-in customer record without inventing a Telegram identity.
- Park/hold a cart and retrieve it later.
- Add customer-visible and internal notes separately.
- Pickup, delivery, or counter-sale fulfillment.
- Address/courier/delivery-fee selection when delivery is chosen.
- Automatic charges, discounts, coupons, vouchers, tier benefits, and taxes only when configured.
- Optional promo and referral codes through the same independent server validators as customer checkout. Referral requires an identified eligible customer, cannot be applied to an anonymous walk-in, and records the operator/source for abuse review.
- Manual price/discount/fee override only with an explicit permission, reason, and optional supervisor approval.
- Real-time server quote and a final confirmation screen.

POS cannot bypass stock, pricing, coupon, payment, risk, customer-block, or tenant rules. It may use explicitly configured POS-only rules, but those rules must still be versioned, server-evaluated, visible in the quote, and audited.

### 13A.3 POS tender and completion

Support:

- Cash with tendered amount and change due.
- External card terminal result/reference without storing card number, CVV, or track data.
- E-wallet or bank transfer with reference/proof policy.
- Configured manual payment methods.
- Split tender across enabled methods.
- Partial payment only when tenant policy allows it.
- On-account/store-credit tender only if a future explicitly enabled ledger supports it; do not fake credit balances.

Every tender creates immutable payment/tender records. The POS finalizes the order only after the server validates the quote, tender totals, inventory, customer restrictions, and idempotency key. Generate a customer receipt suitable for screen, browser print, PDF download, or queued Telegram delivery when the customer can receive bot messages.

### 13A.4 POS corrections and controls

- A pre-completion line can be removed with an audit event.
- A completed sale cannot be deleted.
- Void, refund, return, exchange, and payment reversal are separate controlled workflows with permission, reason, original-order link, inventory/payment effects, and audit.
- Supervisor approval is configurable for price override, excessive discount, void, refund, negative variance, and reopening a shift.
- When the server is unavailable, POS may show a clearly labeled read-only cached catalog but must block final sale/payment completion. Do not implement unsafe offline order queuing in the initial release.
- Do not integrate proprietary cash-drawer, payment-terminal, or printer hardware without a configured adapter and test device. Browser print and keyboard-wedge barcode input are the safe production defaults.

## 14. Charges management

Create a configurable rule engine for legitimate non-product charges:

- Fixed amount or percentage.
- Per order, per item, per quantity, per weight, or per service.
- Optional minimum/maximum cap.
- Conditions based on subtotal, category, product, delivery option, payment method, customer tier, location/zone, schedule, or explicit customer selection.
- Priority and deterministic application order.
- Inclusive or additive display behavior.
- Start/end schedules.
- Active/draft/archived status.
- Customer-facing label and explanation.
- Internal label and audit history.
- Preview/test calculator in admin.

Never allow a charge to be added invisibly. Every payable charge must appear in the quote, order, admin view, receipt/summary, and reports with its source rule.

Do not use Charges Management to recreate, extend, or bypass the courier formula in Section 16. A charge cannot be labeled or conditioned as an extra delivery, distance, remote-area, weight, courier, or night fee outside the approved delivery calculator.

## 15. Discounts, promos, coupons, and vouchers

Support:

- Automatic promotions.
- Entered coupon codes.
- Single-use or multi-use vouchers.
- Fixed amount, percentage, free delivery, or specified-item benefit.
- Product/category/variant scope.
- Minimum spend and quantity.
- Customer tier and first-order eligibility.
- Customer allowlist/denylist where lawful.
- Per-customer, global, and campaign usage limits.
- Budget caps.
- Start/end schedule and tenant time zone.
- Case-insensitive normalized code matching without exposing codes in logs.
- Stacking/exclusivity rules with deterministic priority.
- Redemption reservation and finalization.
- Cancellation/refund restoration policy.
- Admin preview against a sample cart.
- Usage, revenue, discount cost, and abuse report.

Use immutable redemption records. Prevent concurrent over-redemption. A coupon typed by the customer is never trusted as entitlement until the server evaluates it.

A configured free-delivery promotion may discount the already calculated delivery fee as a separate visible discount line. It must not change the stored road distance, calculator components, config version, or original delivery-fee amount.

## 15A. Referral system

Implement referral attribution as a real server domain integrated with customers, checkout quotes, orders, vouchers, fraud review, reporting, and audit. Do not implement only a decorative referral input.

### 15A.1 Program and code management

Admin Referral Management supports:

- Tenant-scoped program status, internal/customer-facing name, description, effective dates, tenant time zone, and version.
- Eligibility for referrers and referred customers, including enabled customer tiers, minimum qualifying subtotal, included/excluded products or categories, first-order definition, and qualifying order state.
- A referred-customer benefit of fixed or percentage discount through the existing discount engine, with clear caps and budget.
- A referrer reward issued only as an existing-system voucher after the referred order reaches the configured qualifying state. Configure fixed/percentage/free-delivery voucher benefit, expiry, scope, and limits through Voucher Management.
- Per-code use limit, per-referrer qualified-referral limit, program-wide budget/use limit, reward delay where required for fraud review, and cancellation/refund reversal policy.
- Admin create/disable/regenerate controls, customer-code assignment, safe search, status/history, dry-run validation, and audited bulk operations.

Do not create cash balances, withdrawable commissions, multi-level referrals, referral trees, or a second discount/reward ledger. Reuse the voucher and discount engines plus an idempotent referral-reward event.

Issue each eligible customer a stable, random, non-sequential, tenant-unique referral code. Codes must not encode Telegram ID, phone, customer database ID, or other personal data. Normalize lookup with Unicode NFKC, trim, and uppercase; enforce case-insensitive uniqueness at the datastore boundary. A disabled/regenerated code preserves historical attribution and cannot rewrite old orders.

### 15A.2 Validation, attribution, and reward lifecycle

Server validation must check:

- Correct tenant, enabled program/code, effective window, channel, product/category/minimum-spend rules, caps, and remaining budget.
- The referring customer exists and is eligible.
- The referred customer is eligible under the documented first-order rule and has not already consumed a one-time referral attribution.
- The referrer and referred customer are not the same Telegram/customer identity.
- Reuse/link signals such as matching normalized phone, payment reference/account, delivery address risk hash, restricted device/session signal, or prior fraud case are assessed without making a single heuristic an automatic ban.
- The referral code is independent of the promo code. Both may coexist only when the program’s explicit stacking policy allows their separate benefits; return a deterministic conflict otherwise.

On a valid quote, create a provisional attribution bound to the tenant, checkout session, referred customer, referrer, code, program version, benefit preview, and expiry. At idempotent order creation, snapshot and finalize that attribution on the order. After order creation:

- The original referral attribution cannot be replaced by an order edit or amendment.
- A qualifying order transition emits one idempotent reward event and at most one voucher issuance for that attribution.
- Cancellation, refund, chargeback, confirmed fraud, or other configured disqualification creates a reversal event. Revoke an unused reward voucher when policy permits; if already used, flag an Admin reconciliation case rather than deleting history or creating a negative cash balance.
- Preserve statuses such as `provisional`, `attributed`, `pending_qualification`, `qualified`, `reward_issued`, `reversed`, `rejected`, and `expired` with reason and timestamps.

### 15A.3 Customer and Admin experience

- Account shows the eligible customer’s referral code, a copy action, Telegram share action using customer-safe program copy, qualified/pending referral counts, and issued voucher rewards. Never reveal referred customers’ private identities to the referrer.
- Checkout uses the right-hand optional REFERRAL CODE field defined in Section 13.2 and shows the exact referred-customer benefit before confirmation.
- Customer Order Detail shows separate `PROMO CODE` and `REFERRAL CODE` rows in the bill/benefit breakdown. Show an em dash when either optional code was not applied; when applied, show its code/benefit and the referral attribution/reward status without referrer PII.
- Admin Order Detail always shows separate `PROMO CODE` and `REFERRAL CODE` rows in the breakdown, using an em dash when not applied. When present, include code snapshot, promo discount, referral benefit, program/version, attribution status, and permission-gated link to the referrer record. Never merge them into a generic “discount code” row.
- Admin Referral Management provides program settings, code/customer lookup, attribution timeline, qualifying order link, reward voucher link, rejection/reversal reason, abuse signals, manual review, and reports. Any manual qualify/reject/reverse/reissue action requires permission, reason, idempotency, and audit.

Referral analytics include issued/active codes, entered-to-valid conversion, attributed and qualified orders, referred revenue, referred-customer discount cost, issued/redeemed/reversed referrer vouchers, cap/budget utilization, rejection reasons, and suspected self/referral abuse. Use defined tenant/time-zone/currency boundaries and exclude test/demo data.

## 16. Courier and delivery-fee management

Implement configurable courier companies and one approved road-distance Delivery Fee Calculator inside Courier Management. Do not build a second delivery-pricing engine or generic zone/weight/order-value/per-item fee formulas. Free-delivery promotions, if enabled later, remain explicit discount lines applied after this calculator rather than hidden calculator branches.

### 16.1 Courier administration

Inside Courier Management, first provide a tenant/store-scoped `DELIVERY ORIGINS` registry. An authorized Admin can create, edit, activate/archive, and test multiple saved origins using a clear name, customer-safe pickup label, confirmed address, validated latitude/longitude, optional pickup instructions, and version. Coordinates may come from Geoapify lookup, current map pin, or carefully validated manual entry; the server revalidates ranges and provider result before saving.

Render a compact radio/select control over active saved origins and allow exactly one active default per operational store/fulfillment scope. Switching the default is one atomic, permission-checked mutation with before/after audit and config-version increment. The default origin is the sole normal origin used for new road-route charge calculations and courier pickup instructions. Do not allow the current default to be archived/deleted until another active origin is selected in the same transaction. If none exists, block delivery quoting with an Admin configuration error rather than use zero coordinates or a guessed origin.

Every delivery quote snapshots the chosen default origin ID, name, coordinates, and version. A later default-origin switch invalidates affected uncommitted checkout quotes/drafts but never rewrites an already submitted order, route, fee, or pickup history. Do not let a customer select/override the origin. A future courier-specific override is out of current scope; use the selected default consistently for all enabled couriers in the scope.

For each courier configure:

- Tenant-scoped name, stable code, customer-safe logo, status, support details, and sort order.
- `available` / `unavailable` operational toggle. Store operator, reason, effective time, and audit event for every change.
- Optional serviceability zones/exclusions and maximum route distance used only to decide availability; they never add or alter a fee component.
- Geoapify routing mode appropriate to the courier, limited initially to the documented road modes actually needed, such as motor scooter or drive. Do not invent a route when a mode fails.
- Optional service label and ETA display; these do not alter the fee formula.
- Tracking URL template restricted to approved HTTPS domains.
- The versioned calculator fields in Section 16.3 and a preview tool that accepts a test destination, shows the returned road distance, all components, total, and exact config version.

Validate uploaded logos as safe raster/vector brand assets according to the media policy, preserve aspect ratio, and provide accessible courier names even though the customer tile does not show a text label.

### 16.2 Geoapify address and location workflow

Use Geoapify for all four requested location functions through authenticated application endpoints:

- Address Autocomplete for bounded suggestions while the customer types.
- Forward Geocoding for a confirmed/manual address that still needs coordinates.
- Reverse Geocoding for a current-location result or dropped pin.
- Routing for the road route from the Admin-selected default delivery origin to the confirmed destination.

Implementation contract:

- Proxy autocomplete, forward-geocoding, reverse-geocoding, and route requests through the serverless backend so the main `GEOAPIFY_API_KEY` is never exposed. If Geoapify map tiles require a browser key, use a separate origin/API/CORS/referrer-restricted key and never reuse the server key.
- Send address/search input in authenticated POST bodies, not URL paths that application logs retain. Redact exact address and coordinates from routine logs and error reporting.
- For the default Philippine tenant, send Geoapify `filter=countrycode:ph` plus `bias=proximity:<longitude>,<latitude>` centered on the configured Metro Manila/National Capital Region search-bias point. Do not apply an NCR boundary filter because nearby provinces must remain searchable. Keep country, preferred region, bias point, and safe region aliases configurable per tenant rather than embedding them in reusable domain rules.
- To make Metro Manila the top-result preference without hiding nearby provinces, request a bounded provider candidate set (normally 8–10), validate/normalize it on the server, then apply a stable ranking boost to candidates whose returned structured administrative metadata matches the configured Metro Manila/NCR region. Within the same preference band preserve provider relevance/confidence and proximity order; return no more than five. Philippine candidates from Bulacan, Cavite, Rizal, Laguna, and other nearby provinces remain eligible after preferred-region matches. Never rewrite an address or pretend that an ambiguous result is in NCR.
- Start autocomplete after at least three meaningful characters, debounce exactly 300ms after the latest input, cancel/ignore stale requests, and cache short-lived normalized results to conserve Geoapify credits. Deduplicate by provider place ID or normalized coordinates/address and keep keyboard/touch selection accessible.
- Persist the customer-confirmed structured address, formatted address, latitude, longitude, provider place identifier when available, match/confidence metadata, and the separate `FLOOR/UNIT NO./INSTRUCTIONS` text. Never treat an autocomplete label alone as a validated destination.
- Display required Geoapify/OpenStreetMap attribution wherever provider map tiles or data terms require it.

Customer address controls:

- Provide a clear `USE CURRENT LOCATION` action. Request browser/Telegram WebView geolocation only after that direct user gesture; explain why it is needed and never request continuous/background tracking.
- On success, reverse-geocode the returned coordinates, move the pin, fill the structured address, and require customer confirmation/correction before quoting.
- On denial, timeout, unavailable GPS, or low accuracy, keep manual autocomplete and `DROP A PIN` fully usable. Do not block checkout merely because location permission was denied.
- Provide `DROP A PIN` on a compact map. A tap or drag updates coordinates, calls reverse geocoding after the movement settles, and presents the resolved address for confirmation. Retain the three-line `FLOOR/UNIT NO./INSTRUCTIONS` field because a road pin may not identify the exact entrance.
- Validate coordinate ranges and service-area eligibility on the server. Never trust browser-supplied distance or a client-calculated fee.

After a confirmed destination and courier selection, resolve the currently active default delivery origin on the server and call Geoapify Routing with that origin and destination. Use the returned route `distance` in meters as the authoritative distance input. Never accept an origin, default flag, or straight-line/Haversine distance from the browser for the normal quote. Store only the bounded route facts needed for quoting and audit—not the customer’s continuous movement history.

If routing is unavailable, times out, returns no safe road route, or exceeds configured service limits, show the courier as unavailable for that quote with a clear reason and retry. Do not silently fall back to a guessed fee. An authorized manual delivery-fee override is an exceptional order action with permission, explicit reason, before/after values, and audit; it is not another calculator formula.

### 16.3 The only delivery-fee formula

Each versioned courier fee configuration has exactly these inputs:

- `base_distance_km`, default 3.5 km.
- `base_fare_minor`, covering road distance from 0 through the base distance.
- `excess_per_km_minor`, applied only to distance beyond the base distance.
- Optional fixed `platform_fee_minor`.
- Optional `per_km_surcharge_minor`, applied to every road-route kilometer.
- Optional fixed `night_fee_minor` plus tenant-time-zone start/end window. For scheduled fulfillment use the requested window; otherwise use the server quote/order time according to one documented tenant policy.

Calculate on the server:

- `road_distance_km = route_distance_meters / 1000`.
- `excess_distance_km = max(0, road_distance_km - base_distance_km)`.
- `excess_charge_minor = excess_distance_km × excess_per_km_minor` before the one permitted monetary rounding step.
- `distance_surcharge_minor = road_distance_km × optional_per_km_surcharge_minor` before the one permitted monetary rounding step, or zero when disabled.
- `delivery_fee_total_minor = base_fare_minor + excess_charge_minor + platform_fee_minor_or_zero + distance_surcharge_minor + night_fee_minor_or_zero`.

Use decimal-safe/integer-minor-unit arithmetic. Preserve raw route meters and configured rates, round each distance-derived monetary component once using the versioned currency rule, then sum the rounded components. Reject negative values, invalid windows, missing origin/destination coordinates, stale config versions, and unsupported currency. The calculator must not add undeclared weight, item, order-value, payment-method, remote-area, or zone charges.

The immutable delivery quote returns courier/config version, origin/destination snapshot, route mode, route distance in meters, optional route duration, base-distance allowance, each named fee component, total delivery fee, currency, generated time, and short expiry. Cache an identical normalized origin/destination/mode request briefly, but revalidate courier availability and config version before order creation.

### 16.4 Customer courier selector and fee-payment timing

Render courier choices as a strict compact four-column tile grid at customer mobile widths:

- Use `grid-template-columns: repeat(4, minmax(0, 1fr))`. If more than four couriers are configured, continue in additional four-column rows; do not turn the selector into oversized cards or a horizontal carousel.
- Each tile visually contains only the courier logo and the centered delivery-fee value. Put the logo behind the value at slightly reduced opacity, approximately 0.55–0.70 after contrast testing, so the fee remains dominant and readable.
- Supply courier name, fee, availability, and selected state through accessible text. Retain at least a 44px target, visible focus, selected border/check treatment, and adequate contrast without adding a visible company-name label.
- Before a destination can be quoted, show a centered em dash or compact loading placeholder without changing tile size.
- A courier toggled UNAVAILABLE remains in its configured position and remains visible. Disable selection, reduce the logo further if needed, and replace the centered fee with a clear `UNAVAILABLE` badge. Do not remove, reorder, or silently hide it. Archived/deleted couriers are not customer choices.
- A courier that is globally available but cannot serve the current route may use the same visible UNAVAILABLE treatment for that quote, with an accessible reason outside the tile.

Immediately after the customer selects an available courier, show a required compact prompt with exactly two choices:

1. `PAY AT CHECKOUT`.
2. `PAY UPON DELIVERY`.

The customer must choose one before the final quote. If a courier is not permitted to collect upon delivery, keep that option visibly disabled with a concise reason rather than accepting it and failing later. Persist the selection in the checkout session and quote.

For `PAY AT CHECKOUT`, add the delivery fee to the payment amount due now and the expected QR/gateway receipt amount. For `PAY UPON DELIVERY`, exclude it from the checkout payment amount, create a separate delivery-fee obligation, show it in the order and courier/dispatch workflow, record collection/reconciliation status, and never mark it paid merely because merchandise payment was approved.

Every custo2mer bill, final confirmation, order detail, Admin review, dispatch view, and receipt must clearly show the selected courier, road distance, itemized delivery-fee components, total delivery fee, `PAY AT CHECKOUT` or `PAY UPON DELIVERY`, amount due now, amount due upon delivery, and full order grand total.

## 17. Payment management

For the current customer checkout release, enable exactly two payment methods. Keep future adapters behind disabled extension points and do not expose cash, generic manual transfer, Telegram Invoice, or another unfinished method in the customer UI. POS cash and external-terminal tenders remain governed separately by Section 13A.

### 17.1 Static QR Ph

Implement one configurable static QR payment method intended for Philippine banks and e-wallets that support QR Ph:

- An authorized Admin uploads the actual QR image through Payment Management. Do not generate, guess, scrape, or bundle a placeholder production QR.
- Validate the upload’s MIME type, magic bytes, dimensions, and size; accept safe configured raster formats; store the original privately; create a crisp customer-safe derivative; hash/version it; and audit upload, replacement, activation, deactivation, and access.
- Store tenant-scoped display name, customer instructions, destination/account label, masked destination details, supported currency, min/max amount, active schedule, proof deadline, and sort order. Never expose a full sensitive account identifier unnecessarily.
- Show the QR clearly at checkout with zoom/save guidance appropriate to a Telegram WebView, the exact amount due at checkout, and an explicit `UPLOAD PAYMENT RECEIPT` next action.
- State accurately that compatible participating bank/e-wallet apps may scan QR Ph. Do not claim that an institution without QR Ph support is compatible.

Static QR has no trusted real-time settlement feed. Its receipt analysis plus authorized human review determines application approval, subject to later reconciliation.

### 17.2 Card payment gateway

Implement one provider-neutral card-gateway adapter and one real provider configuration only after the owner supplies the provider and credentials:

- Create the payment session server-side from the immutable quote and checkout payment draft amount due at checkout. Use provider idempotency, approved return/cancel URLs, checkout/payment-draft correlation metadata, currency, and least-privilege credentials; link the provider intent to the order only during idempotent final submission.
- Use the provider-hosted payment page or tokenized SDK so card PAN, CVV, track data, and raw payment credentials never traverse or enter the application database/logs.
- Treat browser redirect/callback success as user-experience state only. It cannot mark a payment settled or approved.
- After the provider returns the customer, refetch the application payment status with bounded short-lived polling or the gateway SDK’s safe client event plus server confirmation. Stop when terminal/timeout/hidden; the verified webhook-backed server state remains authoritative.
- Expose a dedicated webhook endpoint that verifies the provider signature against the raw request body, checks timestamp/replay rules, deduplicates provider event IDs, and reconciles provider payment ID, internal intent, amount, currency, order, and terminal status before recording settlement.
- Store minimal encrypted/redacted provider identifiers, webhook events, settlement state, failure/reversal/dispute state, and reconciliation history. Return a fast safe response and process durable follow-up idempotently when the provider requires it.
- Never retry a charge-creation or capture call without a provider idempotency key. Never log gateway secrets, full payloads containing card data, or customer card details.

### 17.3 Mandatory proof for both methods

Set `proof_required = true` for Static QR Ph and the card gateway. This is a fixed current-release policy, not an optional toggle:

- A customer cannot make the final order-submission request until a safe Static QR or gateway receipt/proof is durably attached to the checkout payment draft. Failed file-security validation requires a replacement; receipt-risk failure does not.
- A gateway webhook may confirm provider settlement in real time, but it does not waive the upload. After returning from the gateway, require the customer to upload the provider receipt/screenshot/image and complete the stored pre-screen result before final order submission.
- Keep gateway settlement facts and proof-review facts as separate state dimensions. Provider settlement is stronger evidence; the uploaded image supplies the required uniform evidence/review record. Neither the browser callback nor image alone overwrites the other.
- If the webhook confirms payment but proof/final submission is missing, record `provider_settlement_state = confirmed` on the checkout payment draft; show a persistent upload/resume action, send configured reminders, and place it in a permission-gated Admin payment-draft recovery queue. It is not yet an order and must not inflate ON QUEUE. Never expire/delete a confirmed settlement merely because checkout was abandoned.
- If proof arrives before the webhook, retain and analyze it and allow final order submission with its VALIDATED/UNVALIDATED classification. Keep the resulting order in payment review and block final gateway payment approval until verified provider status is confirmed or an authorized reconciliation exception is recorded.
- If webhook facts and receipt facts disagree on amount, currency, reference, provider, or status, route to payment review with a high-priority deterministic mismatch. Do not auto-reject a legitimately settled payment without human/reconciliation handling.
- The expected receipt amount is the quote’s amount due at checkout. It includes delivery fee only for `PAY AT CHECKOUT` and excludes delivery fee for `PAY UPON DELIVERY`.

For both methods support display name, instructions, media, availability, schedule, min/max amount, PHP currency for the default tenant, customer restrictions, expiry/reminders, and fully audited Admin configuration. Payment fees/discounts, if ever enabled, must remain explicit quote lines from the existing rule engines.

Payment entities:

- Checkout payment draft.
- Payment intent.
- Payment attempt.
- Proof/evidence.
- Extracted receipt data.
- Risk assessment.
- Review decision.
- Provider/webhook event.
- Reconciliation record.
- Refund/reversal record where applicable.

Payment states:

- created
- awaiting_payment
- proof_submitted
- analyzing
- review_required
- approved
- rejected
- expired
- cancelled
- refunded
- partially_refunded, only if partial refunds are enabled

For the gateway also maintain a separate provider settlement state: `not_applicable`, `pending`, `confirmed`, `failed`, `reversed`, or `disputed`. Do not overload the proof/review state to represent provider settlement.

Enforce allowed transitions. Record actor, reason, timestamp, old state, new state, idempotency key, and supporting evidence. Payment approval does not mutate the original proof, submission-time VALIDATED/UNVALIDATED classification, or analysis history.

No payment reaches application state `approved`, and no order becomes `confirmed`, until the mandatory safe proof exists, an authorized reviewer records the required decision, and—when the method is the card gateway—the provider settlement state is confirmed or an authorized documented reconciliation decision resolves an exception. An `UNVALIDATED` submission may still be approved after evidence-backed human/reconciliation review; the pre-screen label itself is neither an automatic approval nor rejection gate.

## 18. Payment proof upload and receipt image analysis

Build an operational analysis pipeline, not a decorative “Analyze” button. It has two outcomes with different authority: the customer-facing submission pre-screen produces `VALIDATED` or `UNVALIDATED`, while the later authorized human payment/order review produces the actual approval/rejection/escalation decision. Never label the pre-screen as payment approval.

### 18.1 Upload security

- Private object-storage bucket for the Cloudflare deployment.
- Server creates short-lived, single-object upload authorization.
- Object path is generated by the server and tenant scoped.
- Accept only configured raster types such as JPEG, PNG, and WebP.
- Reject SVG, executable/polyglot content, unsupported MIME/magic-byte mismatch, oversized files, unreasonable dimensions, and decompression-bomb patterns.
- Default maximum 10 MB, configurable.
- Store the original immutably.
- Compute SHA-256.
- Create safe preview derivatives without overwriting the original.
- Do not expose public bucket URLs.
- Limit download links to authorized reviewers and short expiry.
- Strip sensitive object names and never use a customer-supplied filename as the storage key.

### 18.2 Analysis stages and non-blocking submission contract

Run analysis through an idempotent durable job keyed to the checkout payment draft and proof version:

1. File validation and metadata capture.
2. Cryptographic hash and perceptual-hash generation.
3. Exact duplicate search across the tenant.
4. Near-duplicate/perceptual match search.
5. OCR/structured field extraction through a provider adapter.
6. Field normalization.
7. Comparison against expected immutable quote/checkout-payment-draft facts and, after submission, the linked order/payment facts.
8. Image-forensic risk-signal analysis where supported.
9. Rule-based risk scoring.
10. Persisted result and reviewer queue routing.

The checkout UI submits the job once and polls the persisted status; refresh, device change, duplicate request, or queue retry must resume the same run rather than spend analyzer credits twice. Complete deterministic checks first and call the configured OCR/multimodal adapter at most once per unchanged proof/analyzer version unless an authorized reviewer requests re-analysis.

Use a configurable bounded customer wait, default 30 seconds through `RECEIPT_SCREENING_MAX_WAIT_SECONDS`. If the complete configured analysis returns within the bound, map a defined low-risk/full-match pass to `validated`; map a failing, mismatched, duplicate-risk, high-risk, or inconclusive result to `unvalidated`. If the external analyzer times out, is unavailable, returns invalid schema, or is not configured, persist a terminal customer-facing `unvalidated` result with a precise safe reason and allow submission. The durable job may finish or be rerun for Admin review later, but it must append a new analysis version and must not rewrite the original submission classification.

The `8.3 ANALYSIS RESULT` screen must always explain that Admin will review the uploaded image. Once a safe proof has a persisted `validated` or `unvalidated` result, enable `9.0 ORDER SUBMISSION`; do not require the customer to retry until a model says pass. Both outcomes become `payment_review`/ON QUEUE after submission. Only file-security rejection, expired/changed quote, lost reservation, authentication failure, or another real commerce conflict may block and request corrective action.

Extract when visible:

- Amount.
- Currency.
- Transaction/reference number.
- Sender/payor name.
- Recipient/account label.
- Masked account details.
- Date and time.
- Payment status.
- Provider/bank/wallet.
- Any detected edited/cropped/overlaid or layout-inconsistency signals.

Expected-data comparisons:

- Amount exactness and permitted tolerance.
- Currency.
- Intended payment account/method.
- Reference uniqueness.
- Time relative to the checkout payment draft/payment intent and later linked order.
- Customer-entered reference.
- Sender/payor consistency when available.
- Receipt status indicating success versus pending/failed.
- Duplicate or near-duplicate use on other orders/customers.
- Verified gateway payment ID/settlement state/amount/currency/event time when the method is the card gateway.
- Delivery-fee payment timing so receipt amount is compared with `amount_due_at_checkout`, not blindly with full order grand total.

### 18.3 Honest detection boundary

No OCR model, multimodal model, metadata check, error-level analysis, perceptual hash, or heuristic can prove with certainty that every receipt is authentic or edited.

Therefore:

- Name the feature “Receipt Risk Analysis,” not “Guaranteed Fake Receipt Detector.”
- Return extracted fields, confidence per field, matched facts, mismatches, signals, and a risk score.
- Keep model observations separate from deterministic facts.
- Never auto-ban solely from an AI/vision conclusion.
- Never auto-approve a high-value payment from image appearance alone.
- Treat payment-provider reconciliation or verified settlement records as stronger evidence than the screenshot.
- Route ambiguous, high-value, duplicate, mismatched, low-confidence, or high-risk proofs to human review.
- Permit final order submission for those safely uploaded proofs under `UNVALIDATED`; routing to human review is mandatory but is not a customer-submission veto.
- Allow reviewer correction of extracted fields while preserving the original extraction and audit history.

### 18.4 Analyzer adapter

Define a provider-neutral ReceiptAnalyzer interface with a strict structured result schema. Implement:

- A deterministic baseline analyzer that always works without an AI key: file validation, exact hash, perceptual hash where supported, duplicate search, customer/reference matching, time/amount checks, and manual review.
- One real configured OCR/multimodal provider adapter when credentials are available.
- A test fake adapter using synthetic, non-personal fixtures.
- Timeouts, bounded retries, cost limits, schema validation, redaction-aware logs, and a manual fallback.

If no external analyzer key is present, do not fake a successful AI analysis. Mark the provider stage unavailable and continue the deterministic pipeline and manual review.

Any rule/model threshold that produces `VALIDATED` versus `UNVALIDATED` is versioned, tenant scoped, auditable, and covered by fixtures. `VALIDATED` means only that the receipt passed the automated pre-screen against available facts. It never proves authenticity, settlement, or entitlement to fulfillment.

### 18.5 Reviewer experience

Create a payment review queue with:

- Filters by age, amount, risk, method, status, submission pre-screen classification (`VALIDATED`/`UNVALIDATED`), gateway settlement state, and assigned reviewer.
- A real, clearly rendered receipt-evidence viewer—not a filename, tiny thumbnail, broken object URL, or download-only link.
- Show the safe preview immediately in a contained fit-to-view canvas while retaining authorization-gated access to the immutable original. Preserve aspect ratio and enough resolution to read text.
- Provide zoom in/out, pan, fit width, fit page, 90-degree rotation, reset, fullscreen/lightbox, and permission-gated original download. Controls must work with touch, mouse, and keyboard and must not modify the stored original.
- Show loading progress, unsupported/corrupt preview fallback, retry, dimensions, file type, upload time, and cryptographic hash summary without exposing private object paths.
- Place expected order/payment facts and provider-settlement facts beside or directly below the image on narrow screens so a reviewer can compare them without navigating away. Use a split view on wide screens and stacked view on mobile.
- Expected quote/checkout-payment-draft and linked order/payment facts.
- For gateway payments, display verified webhook/settlement status and timestamp separately from the uploaded customer receipt; make disagreements visually explicit.
- Extracted values with confidence.
- Deterministic mismatches.
- Duplicate/near-duplicate matches with authorization-checked links.
- Risk signals and versioned scoring rule.
- Customer/order/payment history.
- Reviewer notes and internal attachments.
- Approve, reject, request resubmission, escalate, and assign actions.
- Required reason codes.
- Optional dual review.
- Complete audit timeline.

## 19. Order management and fulfillment

Use separate order and delivery/fulfillment state machines.

For every proof-required customer-storefront order, also maintain a separate immutable submission-time receipt pre-screen classification with exactly two customer-facing values:

- `validated` — customer-facing label `VALIDATED`; the safe proof passed the versioned automated pre-screen available at submission.
- `unvalidated` — customer-facing label `UNVALIDATED`; the safe proof failed, mismatched, was inconclusive, or the analyzer was unavailable/timed out.

This field is not an order state, payment state, provider-settlement state, reviewer decision, or fulfillment clearance. Both values start in order state `payment_review`, appear in ON QUEUE, require Admin review of the uploaded image, and follow the same legal state-transition controls. Preserve later analysis/reviewer outcomes as new history; never rewrite the submission-time classification. POS tenders or future channels that legitimately do not require an uploaded receipt use an internal `not_applicable`/null projection and their own tender policy; never mislabel them VALIDATED.

Order states:

- pending_payment
- payment_review
- confirmed
- preparing
- packed
- ready_for_dispatch
- dispatched
- completed
- cancelled
- return_requested
- returned
- refunded
- failed

Delivery states:

- unassigned
- quoted
- booked
- pickup_scheduled
- picked_up
- in_transit
- delivery_attempted
- delivered
- failed
- returned_to_sender
- cancelled

Admin order management:

- Search by order number, PRIME Member ID, Telegram ID/username snapshot and history where authorized, receiver/customer name, phone, reference, tracking number, and SKU subject to permission.
- Filter by order/payment/delivery status, VALIDATED/UNVALIDATED submission classification, date, amount, courier, risk, tier, and assignment.
- Cursor pagination.
- Order detail timeline.
- Customer, items, quote snapshot, charges, discounts, delivery, payment, risk, support, and audit panels.
- Show current Telegram Profile Name/Handle, stable Telegram User ID, and immutable PRIME Member ID as clearly distinct identity facts from receiver/delivery fields. Restrict historical handle/name access to authorized investigation roles.
- Render every required Static QR or gateway receipt directly in the payment panel with the same authorized fit/zoom/pan/rotate/fullscreen viewer used by Payment Review; do not force Order Review to navigate to a raw object URL or filename-only screen.
- Valid transition actions only.
- Bulk actions only for safe compatible transitions and with preview.
- Packing checklist.
- Internal notes distinct from customer-visible notes.
- Courier assignment, booking adapter, tracking number, label/document attachment.
- Delivery-fee payment timing and collection status. For PAY UPON DELIVERY, require the authorized dispatch/settlement workflow to record collected, failed collection, waived with approval, reversed, or reconciled; dispatch alone must not imply collection.
- Dispatch confirmation.
- Delivery event tracking.
- Cancellation/refund/return reason.
- Customer notification outbox.

### 19.1 Admin customer-detail copy controls

In Admin Order Management → Order Detail, create one compact Customer Details section using the immutable order/customer-delivery snapshot relevant to that order. Show at minimum:

- Receiver Name.
- Receiver Contact No.
- Complete delivery address.

Place a copy icon/button immediately beside each value so an authorized operator can copy that field independently. Requirements:

- Use a familiar copy icon with tooltip and accessible labels such as `Copy customer name`, `Copy contact number`, and `Copy delivery address`. The visual icon may remain compact, but its hit target is at least 44px and has keyboard focus.
- Require a granular `orders.copy_customer_pii` permission in addition to order-view permission. Hide or disable the action for masked fields and unauthorized roles; the API rechecks tenant, order, and permission.
- Use a server endpoint that records the authoritative `pii_copy_value_released` audit event and returns only the requested authorized field. Do not trust a client-generated audit claim or expose all fields through a bulk-copy endpoint.
- Copy the clean value without UI labels: exact Receiver Name; normalized callable Receiver Contact No., preferably E.164 when available; and the complete customer-confirmed address snapshot including the `FLOOR/UNIT NO./INSTRUCTIONS` line when non-empty.
- Exclude internal notes, coordinates, Geoapify identifiers/confidence, risk flags, Telegram identifiers, and unrelated customer data from the address clipboard text.
- Use the Async Clipboard API in the secure context, with a safe selection-based fallback when unavailable. Never read existing clipboard contents.
- Show a short success result such as `Name copied`, `Contact number copied`, or `Delivery address copied`; provide a non-destructive error/retry state when clipboard writing fails.
- The server audit event records actor, order/customer reference, requested field type, route/source, timestamp, and whether release was allowed/denied/failed—but never the PII value. Clipboard-write success is a local UI result; if recorded as a separate best-effort client event, label it as client-reported rather than server proof. Do not send clipboard contents to analytics, logs, or error reporting.

Also place separate PROMO CODE and REFERRAL CODE rows in the Order Detail bill/benefit breakdown as specified in Section 15A.3. These belong in the breakdown, not inside the Customer Details copy controls.

### 19.2 Full order edit and amendment workflow

Authorized Admin, Operations, or Store Staff users must be able to modify an existing order through a controlled, versioned workflow. “Edit order” never means overwriting history.

Support changes to:

- Customer-provided contact information.
- Delivery address and delivery notes.
- Pickup/delivery choice.
- Courier/service and delivery fee.
- Add/remove item.
- Variant and quantity.
- Eligible discount, coupon, voucher, and charge.
- Internal and customer-visible notes.
- Requested fulfillment schedule where configured.

Rules by lifecycle:

- pending_payment or payment_review: create a new order revision from the current revision, re-run quote/inventory/risk checks, and apply only after confirmation.
- confirmed or preparing: require an Order Amendment with reason, permission, preview, and optional supervisor approval.
- packed: require an explicit unpack/reopen operation before item changes; preserve the original packing record.
- ready_for_dispatch: allow only policy-approved fields and require fulfillment revalidation.
- dispatched or in_transit: prohibit silent item, amount, address, and courier edits. Use courier intervention, cancellation/return-to-sender, replacement shipment, or reshipment workflows.
- delivered/completed: use return, exchange, refund, or post-sale adjustment workflows; do not rewrite the sale.
- cancelled/refunded/failed: keep immutable except for notes, tags, case links, or explicitly modeled correction metadata.

Every amendment must:

1. Capture base order revision and optimistic concurrency version.
2. Record initiator, source channel, reason code, free-text justification where required, request/session ID, store/register/shift when POS-originated, and timestamp.
3. Build a server-authoritative preview showing field-by-field before/after values and money delta.
4. Re-evaluate price, discounts, charges, tier benefits, delivery fee, stock, reservations, customer restrictions, and fraud rules.
5. Show inventory releases/reservations and fulfillment impact.
6. Produce payment_delta as additional_due, refund_due, or zero.
7. Create a new payment intent for additional_due; never inflate or rewrite an approved payment.
8. Create a refund/credit obligation for refund_due; never mark funds returned until the actual refund workflow confirms it.
9. Require customer reconfirmation when policy or a material customer-facing change demands it.
10. Notify the customer of the applied change and updated totals/status where delivery is possible.
11. Append immutable order revision, amendment, ledger, payment, inventory, notification, and audit records atomically or through a recoverable outbox flow.
12. Be idempotent and reject a stale base revision with a structured conflict/diff.

Admin UI must provide Preview Changes, Save Draft Amendment, Submit for Approval, Apply, Reject, and Cancel Amendment actions according to state and permission. Display revision number, amendment status, approver, delta, and a readable side-by-side or field-by-field diff. Never hide earlier revisions.

Dynamic action buttons must be derived from current states and permissions. Do not display actions that cannot legally execute. The server repeats all transition and permission checks.

## 20. Customer management and tiers

Customer management:

- Customer profile with immutable PRIME Member ID / Internal Customer ID, stable lossless Telegram User ID, current Telegram name/handle snapshot, and permission-gated append-only name/handle history.
- Contact and address history with privacy controls.
- Orders, payments, receipts, support tickets, risk events, interventions, flags, and tier.
- Tags and internal notes with author/timestamp.
- Search and filters.
- Export with permission, recent reauthentication, reason, and audit.
- Merge only through a guarded owner/admin workflow; never merge automatically from similar names.
- Soft deletion/anonymization workflow subject to financial/audit retention.
- Communication preferences and consent version.

Customer tiers:

- Configurable name, rank, color/token, qualification rules, active period, and status.
- Manual assignment with reason and expiry.
- Automatic qualification based on confirmed/completed metrics only.
- Benefits may affect discount, delivery, payment-method eligibility, support priority, or limits.
- Tier evaluation is server-side and versioned.
- Keep tier history and the rule version that caused a change.
- Fraud or refund behavior must not silently demote a customer unless an explicit rule does so.

## 21. Fraud detection, investigation, intervention, flagging, blocking, and banning

Build a defensive risk and case-management system.

### 21.1 Signals

Possible signals include:

- Stable Telegram User ID/PRIME Member ID continuity across observed handle changes, or evidence of attempted identity/account linkage; use it to investigate continuity, never as sole proof of fraud.
- Exact or near-duplicate proof.
- Reused transaction reference.
- Amount/currency/account/time mismatch.
- Multiple failed or rejected proof attempts.
- Order/payment velocity.
- Voucher abuse.
- Repeated cancellations after reservation.
- Shared normalized address, contact, receipt, or payment reference across suspicious accounts.
- Session/auth anomalies.
- Provider webhook contradiction.
- Manual analyst observation.

Use privacy-preserving, purpose-limited data. Do not invent a stable Telegram device ID; Telegram Mini Apps do not provide one. Do not perform invasive fingerprinting. If IP/UA risk data is used, minimize it, hash/truncate where possible, restrict retention, and document the purpose.

### 21.2 Risk assessment

- Versioned rules.
- Weighted score plus severity.
- Explainable signal list.
- Confidence and evidence references.
- Outcome: allow, monitor, hold, manual review, step-up, temporary block, or case escalation.
- No silent permanent punishment.
- Admin simulator for testing rules against synthetic events.
- Metrics for false positives and reviewer overrides.

### 21.3 Investigation cases

Create:

- Case number.
- Type, severity, status, owner, and SLA.
- Linked customers, orders, payments, proofs, vouchers, addresses, and references.
- Chronological evidence timeline.
- Analyst notes.
- Tasks/actions.
- Attachments.
- Decision and reason.
- Appeal/review status.
- Audit log.

Case states: open, triage, investigating, action_required, monitoring, resolved, dismissed, appealed, reopened.

### 21.4 Interventions

Support narrowly scoped, expiring actions:

- Hold an order.
- Require payment resubmission.
- Require manual payment review.
- Disable a payment method for one customer.
- Disable coupon eligibility.
- Restrict order value/velocity.
- Temporarily block checkout.
- Block a specific reference/proof hash.
- Temporarily block a customer.
- Permanently ban a customer.

Every intervention has scope, start, expiry where applicable, actor, reason, evidence/case link, customer-visible message policy, and reversal history.

Permanent ban requirements:

- Owner permission.
- Recent reauthentication.
- Explicit case/reason.
- Idempotency key.
- Confirmation showing impact.
- Session revocation.
- Audit event.
- Appeal/review path.
- Unban action with separate reason and audit.

Never ban based solely on one model-generated receipt opinion, a name similarity, or an unverified device/IP inference.

## 22. Customer support

Storefront support:

- Create ticket.
- Link order/payment when relevant.
- Category, subject, message, and safe attachment.
- View ticket history and status.
- Reply and close/reopen within policy.
- Show service-hours expectation without promising an unavailable live agent.

Admin support:

- Queue by status, priority, age, category, customer tier, and assignee.
- Ticket detail with messages, customer/order/payment context, internal notes, attachments, and audit.
- Assignment.
- Status: new, open, waiting_customer, waiting_internal, resolved, closed.
- Priority and SLA target.
- Canned responses with variables and preview.
- Collision protection when two agents reply.
- Escalation to payment review, operations, or fraud case without copying sensitive data unnecessarily.
- Reporting for first response time, resolution time, reopen rate, and backlog.

Use persisted messages and bounded polling/refetch for the first release. Do not add real-time sockets unless a measured need justifies them.

Provide a queued Telegram Bot notification adapter for order and support updates. Send only permitted, tenant-configured templates; respect whether the user has started the bot or allowed messages; apply Telegram rate limits; store delivery outcome; and keep in-app status as the source of truth when a bot message cannot be delivered.

## 23. Reports and analytics

Build server-derived operational analytics:

- Gross sales.
- Net sales according to a documented formula.
- Orders by state.
- Current and historical ON QUEUE, PROCESSING, and active-load counts by operational queue scope.
- Average order-entry-to-first-READY minutes and first-READY-to-first-DISPATCHED minutes, including valid sample count, metric version, and last-generated time.
- LIGHT/MODERATE/HEAVY traffic-state history using the same exact boundary policy as the global queue monitor.
- Sales/orders by channel: Telegram storefront versus POS.
- POS sales by store/register/shift/operator subject to privacy and role limits.
- POS tender mix, opening/closing cash, expected cash, variance, voids, overrides, and refunds.
- Order-amendment volume, reason, approval time, additional amount due, and refund obligations.
- Average order value.
- Units sold.
- Discounts and voucher cost.
- Referral code validation/conversion, attributed/qualified orders and revenue, referred-customer discount cost, issued/redeemed/reversed referrer vouchers, caps/budget, rejection reasons, and abuse-review outcomes.
- Charges collected.
- Delivery fees collected.
- Delivery-origin usage by store/scope, route failures by origin, default-origin changes, and quote volume/road distance by immutable origin version.
- Delivery fees by courier and component: base fare, excess-kilometer charge, platform fee, per-kilometer surcharge, and night fee.
- Delivery-fee payment timing and collection: paid at checkout, due upon delivery, collected, outstanding, waived/reversed, and reconciled.
- Payment-method mix and approval/rejection time.
- Static QR Ph versus card-gateway volume, confirmed gateway checkout drafts awaiting proof/final submission, recovered/abandoned settled drafts, webhook/proof mismatches, and provider reconciliation exceptions.
- Receipt submission classifications (`VALIDATED`/`UNVALIDATED`) by reason/version, later human approval/rejection outcomes, classification-to-decision disagreement, analyzer timeout/unavailability, and review turnaround. Never report VALIDATED as settled revenue.
- Refunds/cancellations/returns.
- Inventory movement, low stock, sell-through.
- Courier volume, cost, ETA, delivery success.
- Customer acquisition/returning customers.
- PRIME Member ID enrollment counts and Telegram profile-change continuity events in authorized fraud/identity reports, without exposing unnecessary historical handles in general analytics.
- Customer tier performance.
- Support SLA/backlog.
- Fraud case/intervention outcomes.

Requirements:

- Tenant time-zone aware date boundaries.
- Clear metric definitions.
- Date range and comparison period.
- Currency-safe aggregation.
- No mixing currencies without conversion configuration.
- Drill-down to authorized underlying records.
- CSV export with authorization/audit.
- Daily aggregate records/collections updated by idempotent scheduled jobs.
- Reconciliation check between aggregate totals and source ledgers.
- Reconciliation between queue aggregates and authoritative order/payment state, with repair status and freshness visible only to authorized operators.
- Empty and partial-data states.

Avoid adding third-party behavioral analytics until privacy requirements and consent are explicitly approved. Operational events may be stored in the application database/outbox.

## 24. Administration UI

The admin app should feel like a quiet, compact, professional operations product suitable for international client demonstrations.

Use the same fixed 55px global header and fixed 35px five-block queue-monitor shell specified in Section 10.1 across Admin and POS routes. Keep the metrics visible while operators navigate. Provide a separate permission-aware `View queue` action for the full server-filtered operational dashboard; the display-only header remains a summary rather than a substitute for that dashboard.

Use the exact fixed proprietary footer from Section 10.2 on every authenticated Admin and POS route. Do not show the six-tab customer BottomNav in Admin/POS. Reserve the footer/safe-area inset in every table, drawer, modal, POS cart, and review screen so final rows and actions remain reachable.

Do:

- Responsive left navigation on desktop and compact drawer/bottom navigation on mobile.
- Dense but organized lists.
- Search, filters, sort, cursor pagination, saved views only if reuse is real.
- Clear status chips.
- Detail pages with summary header, tabs, timelines, and contextual actions.
- Forms with aligned labels, inline validation, unsaved-change protection, and accessible errors.
- Tables on wide screens and structured list rows/cards on narrow screens.
- Bulk action preview and result report.
- Permission-aware navigation and actions.
- Loading skeletons only when useful; no decorative shimmer everywhere.
- Clear empty, error, offline, and retry states.
- Confirmation for destructive/high-risk actions.
- Toast for transient result plus persistent inline state for important failures.

Avoid:

- Oversized dashboard hero sections.
- Excessive gradients, glassmorphism, huge radii, or card-inside-card layouts.
- Decorative charts with no operational use.
- Hidden critical actions behind ambiguous icons.
- Long explanatory marketing copy inside the product.
- Fake data outside the labeled demo tenant.

Design tokens:

- White page and surface base by default.
- Light grey borders/dividers and slightly dark-grey secondary surfaces/text; near-black primary text.
- One restrained configurable brand accent, used sparingly.
- Semantic success, warning, danger, and information tokens.
- 8px or smaller common radius.
- Minimum touch target 44px for primary interactive controls, even when visual content is compact.
- Non-italic interface typography.
- WCAG 2.2 AA contrast and keyboard/focus behavior.

## 25. Data model

Model at least these logical groups as normalized Cloudflare D1 tables with constraints, indexes, and ordered migrations. Use R2 for private object data and Cloudflare Queues/Workflows for durable asynchronous processing. Choose stable names once in the new project and use them consistently.

Identity and tenancy:

- tenants
- tenant_settings
- tenant_branding
- operators
- roles
- permissions
- operator_role_assignments
- customers
- customer_telegram_identity_history
- customer_addresses
- sessions
- auth_attempts
- telegram_update_receipts

Catalog:

- categories
- products
- product_variants
- product_media
- product_prices
- product_attributes

Inventory:

- inventory_locations
- inventory_levels
- inventory_ledger
- inventory_reservations

Commerce:

- carts
- cart_items
- checkout_sessions
- quote_snapshots
- orders
- order_items
- order_revisions
- order_amendments
- order_amendment_changes
- order_amendment_approvals
- order_status_history
- order_confirmation_snapshots
- charges
- charge_rules
- applied_charges
- discount_rules
- coupons
- voucher_issuances
- discount_redemptions
- referral_programs
- referral_codes
- referral_attributions
- referral_reward_events

POS:

- stores
- pos_registers
- pos_shifts
- pos_cash_movements
- pos_held_carts
- pos_held_cart_items
- pos_tenders
- pos_receipts
- pos_supervisor_approvals

Delivery:

- delivery_origins
- couriers
- courier_services
- delivery_zones
- courier_fee_configs
- delivery_quotes
- delivery_fee_collection_events
- fulfillments
- deliveries
- delivery_events

Payments:

- payment_methods
- payment_accounts
- payment_method_media
- checkout_payment_drafts
- payment_intents
- payment_attempts
- payment_proofs
- payment_provider_events
- receipt_analysis_runs
- receipt_extracted_fields
- payment_reviews
- payment_events
- reconciliation_records
- refunds

Risk:

- risk_rules
- risk_assessments
- risk_signals
- fraud_cases
- fraud_case_links
- fraud_case_events
- interventions
- customer_flags

Customer/support:

- customer_tiers
- customer_tier_assignments
- customer_tier_history
- customer_tags
- customer_notes
- support_tickets
- support_messages
- support_assignments
- customer_notifications

Platform reliability:

- idempotency_keys
- outbox_events
- job_runs
- audit_events
- audit_integrity_checkpoints
- notification_events
- order_queue_metric_aggregates
- order_queue_snapshots
- daily_metric_aggregates
- data_export_jobs

Customers enforce one row per `(tenant_id, bot_id, telegram_user_id)`, storing Telegram IDs losslessly. `prime_member_id` is a required immutable uppercase `[A-Z0-9]{10}` value with deployment-wide uniqueness; generation is CSPRNG-based and retry-on-collision, never sequential or derived. Identity-history rows record only changed observed name/handle snapshots, observation source/time, and safe webhook/session reference. Telegram update receipts uniquely deduplicate `(bot_id, update_id)` and retain only the bounded facts required for replay protection.

The order record or its profile-equivalent projection must contain a unique tenant-scoped human order number; immutable `entered_at`; immutable submission-time `receipt_screening_classification` plus reason/rule version when the channel requires proof; nullable write-once `first_ready_at`; and nullable write-once `first_dispatched_at`. Enforce VALIDATED/UNVALIDATED presence for proof-required storefront orders and `not_applicable`/null only for a documented non-proof channel such as eligible POS tenders. Set these fields in the same authoritative transaction as the corresponding order transition and outbox event. Confirmation snapshots store the initial queue position, estimate, order timestamp/number, grand total/currency, and metric version without other customers’ IDs. The aggregate record is tenant-and-queue-scoped, versioned, and stores the five monitor outputs, sample sizes, generation time, and freshness metadata. Queue snapshots retain bounded operational history for reporting; they never contain customer PII.

Customer addresses store normalized structured fields, customer-confirmed formatted text, latitude/longitude, Geoapify place/provider identifier when available, match/confidence metadata, and the separate three-line `FLOOR/UNIT NO./INSTRUCTIONS` value. Delivery origins are tenant/store/scope records with validated coordinates, active/archive state, version, and an atomically enforced single active default per scope. Delivery quotes snapshot that origin ID/name/coordinates/version, destination, route meters/duration, route profile, courier fee-config version, each fee component, payment timing, due-now/due-later totals, and expiry. Courier fee configs enforce the single formula in Section 16.3; do not preserve obsolete generic fee-rule columns.

Cart items persist `selected_for_checkout`; checkout sessions snapshot selected item IDs, cart version, and selection digest. Checkout payment drafts are unique per active checkout/quote/method version and may own a payment intent, attempts, gateway events, safe proof, and analysis before `order_id` exists. Final order commit links them transactionally. A confirmed gateway settlement on an abandoned draft is retained in a recoverable state and excluded from the order queue.

Payment records keep proof/review state, immutable submission-time VALIDATED/UNVALIDATED classification, later analysis versions, human decision, and gateway provider-settlement state separate. Payment-provider events retain deduplicated provider event IDs and minimal verified metadata. Payment-method media versions the Admin-uploaded QR image. Customer notifications are tenant/customer scoped and retain created/read/expiry state plus an authorization-checked related-record reference; outbound Telegram delivery remains in notification events.

Every D1 schema decision must specify:

- Primary/document key.
- Tenant scope.
- D1 SQL foreign/unique/check constraints.
- Money representation.
- Timestamp behavior.
- Soft-delete/archive policy.
- Sensitive-field treatment.
- Indexes supporting actual query paths.

Do not create an index for every field. Add D1 indexes for authenticated lookup; tenant/bot/Telegram-ID identity uniqueness; global PRIME Member ID uniqueness; bot update deduplication; tenant-scoped lists; status/classification/date queues; order number; submission queue position; SKU; transaction/reference uniqueness; case-insensitive referral-code uniqueness; referred-customer one-time attribution; referral qualification/reward status; active cart/selected lines; reservation expiry; session digest; checkout-payment-draft recovery; proof hashes; provider event IDs/payment IDs; active/default delivery origin per scope; courier availability/config version; delivery quote expiry; outstanding delivery-fee collection; customer notification unread/time; POS shift/register queries; order revisions/amendments; audit sequence/time; and other demonstrated access paths.

## 26. API contract

Version JSON APIs under /v1. Use consistent envelopes and machine-readable error codes.

Minimum customer routes:

- POST /v1/auth/telegram/exchange
- POST /v1/auth/logout
- GET /v1/me
- PATCH /v1/me
- GET/POST/PATCH/DELETE /v1/me/addresses
- GET /v1/me/referral
- GET /v1/me/referrals
- POST /v1/location/autocomplete
- POST /v1/location/geocode
- POST /v1/location/reverse-geocode
- GET /v1/couriers
- POST /v1/delivery/quotes
- GET /v1/catalog
- GET /v1/catalog/products/:id
- GET /v1/order-queue/summary
- GET /v1/cart
- POST /v1/cart/items
- PATCH /v1/cart/items/:id
- DELETE /v1/cart/items/:id
- PATCH /v1/cart/items/:id/selection
- POST /v1/cart/selection, for validated select-all/clear-selection over the caller’s eligible active cart only
- POST /v1/checkout/sessions
- PATCH /v1/checkout/sessions/:id
- PATCH /v1/checkout/sessions/:id/delivery-selection
- POST /v1/checkout/sessions/:id/quote
- GET/POST /v1/checkout/sessions/:id/payment-draft
- POST /v1/checkout/sessions/:id/payment-draft/gateway-session
- POST /v1/checkout/sessions/:id/payment-draft/proofs/upload-intent
- POST /v1/checkout/sessions/:id/payment-draft/proofs/complete
- POST /v1/checkout/sessions/:id/payment-draft/receipt-analysis
- GET /v1/checkout/sessions/:id/payment-draft/receipt-analysis
- POST /v1/orders
- GET /v1/orders
- GET /v1/orders/:id
- GET /v1/orders/:id/confirmation
- GET /v1/orders/:id/queue-status
- GET /v1/payments/:id
- GET /v1/notifications
- GET /v1/notifications/unread-count
- POST /v1/notifications/:id/read
- POST /v1/notifications/read-all
- GET/POST /v1/support/tickets
- GET/POST /v1/support/tickets/:id/messages

Minimum admin route groups:

- /v1/admin/auth
- /v1/admin/dashboard
- /v1/admin/order-queue
- /v1/admin/catalog
- /v1/admin/inventory
- /v1/admin/stores
- /v1/admin/pos
- /v1/admin/orders
- /v1/admin/order-amendments
- /v1/admin/payments
- /v1/admin/payment-reviews
- /v1/admin/charges
- /v1/admin/discounts
- /v1/admin/vouchers
- /v1/admin/referrals
- /v1/admin/couriers
- /v1/admin/delivery-origins
- /v1/admin/delivery-rules
- /v1/admin/customers
- /v1/admin/customer-tiers
- /v1/admin/risk-rules
- /v1/admin/fraud-cases
- /v1/admin/interventions
- /v1/admin/support
- /v1/admin/reports
- /v1/admin/operators
- /v1/admin/settings
- /v1/admin/audit
- /v1/admin/audit/integrity
- /v1/admin/exports

Minimum provider route:

- POST /v1/webhooks/payments/:provider
- POST /v1/webhooks/telegram/:botKey

Webhook routes do not use the customer session. The payment webhook authenticates through the configured provider’s raw-body signature/timestamp scheme, strict provider allowlist where appropriate, replay/idempotency controls, and internal payment reconciliation. The Telegram webhook verifies its configured secret header, bot/tenant mapping, update size/type, and `update_id` deduplication before invoking the shared identity service. Never share either verification secret with the browser.

Required delivery-origin actions inside Courier Management:

- GET/POST /v1/admin/delivery-origins
- PATCH /v1/admin/delivery-origins/:id
- POST /v1/admin/delivery-origins/:id/set-default
- POST /v1/admin/delivery-origins/:id/archive

Setting a default must atomically leave exactly one active default in the scope; archive must reject the current default unless replacement happens atomically. Every mutation requires courier-configuration permission, optimistic versioning, validation, and before/after audit.

Required order-amendment actions:

- POST /v1/admin/orders/:id/amendments/preview
- POST /v1/admin/orders/:id/amendments
- POST /v1/admin/order-amendments/:id/submit
- POST /v1/admin/order-amendments/:id/approve
- POST /v1/admin/order-amendments/:id/reject
- POST /v1/admin/order-amendments/:id/apply
- POST /v1/admin/order-amendments/:id/cancel

Required Admin customer-detail copy action:

- POST /v1/admin/orders/:id/customer-details/:field/copy, where `field` is strictly allowlisted to `name`, `phone`, or `delivery_address`.

This endpoint requires `orders.copy_customer_pii`, tenant/order access, and an authenticated/recent operator session according to policy. It records the redacted value-release audit event before returning only the requested clean value; it never returns all three fields, coordinates, internal notes, or risk metadata in one copy response.

Required POS action families:

- Register and shift open/status/close.
- Cash movement and reconciliation.
- Customer lookup/create/walk-in selection.
- POS cart, hold, retrieve, and abandon.
- Quote and tender preview.
- Idempotent POS order completion.
- Receipt render/print-delivery record.
- Supervisor override request/decision.
- Void/refund/return/exchange workflows linked to the original order.

For list routes provide bounded page size, cursor pagination, validated filters, stable sorting, and tenant scope. Do not return unbounded arrays.

For mutations provide:

- Input schema.
- Permission.
- Current-state requirement.
- Idempotency behavior where relevant.
- Concurrency/version handling.
- Audit behavior.
- Structured success response.
- Structured validation/conflict/permission/rate-limit errors.

Generate an OpenAPI document from or synchronized with the actual contracts. Do not maintain an aspirational API document that diverges from code.

## 27. Reliability and consistency

Implement:

- Request/correlation IDs.
- Structured redacted logs.
- Error boundaries in both apps.
- Timeouts for external calls.
- Bounded exponential retries for safe idempotent work.
- Queue dead-letter handling and admin-visible failed-job status.
- Idempotent background-job consumers because the selected queue/task mechanism may retry or deliver work more than once.
- Transactional outbox or equivalent durable event publication pattern for critical order/payment/inventory transitions.
- Scheduled cleanup for sessions, expired checkout sessions, inventory reservations, upload intents, and stale jobs. Never delete a confirmed/possibly settled gateway checkout draft, its proof, or provider evidence through generic expiry; move it to recovery/reconciliation according to retention policy.
- Idempotent queue-metric projection updates, freshness alarms, and an indexed scheduled reconciliation/rebuild that can repair a drifted aggregate without rewriting order history.
- Health/readiness diagnostics that do not leak secrets or customer data.
- Migration tracking.
- Backup and point-in-time recovery runbook.
- Monthly restore drill instructions.
- Graceful external-provider degradation.
- Geoapify timeouts, bounded retries for safe reads, short normalized response caching, circuit/open-failure state, quota telemetry, and no guessed-route fallback.
- Atomic default-delivery-origin selection, version-aware quote invalidation, and a hard failure when no valid default exists.
- Idempotent receipt pre-screen jobs, a bounded 30-second default customer wait, persisted timeout/unavailable-to-UNVALIDATED fallback, and later append-only Admin re-analysis without duplicate provider spend.
- Durable payment-webhook ingestion with raw-body verification before acknowledgement, provider-event deduplication, retry-safe processing, and reconciliation of missing/out-of-order events.
- Expiry/requote behavior for route, courier-availability, night-window, and fee-config changes; never reuse a stale delivery quote at order creation.

Do not retry irreversible or non-idempotent external actions without a provider idempotency key. Never swallow a failed payment, inventory, dispatch, or audit write and continue as if successful.

## 28. Security baseline

At minimum:

- Server validation for all inputs.
- Output encoding and safe React rendering; no raw HTML without audited sanitization.
- Strict same-origin CORS.
- Secure cookies.
- CSRF protection.
- Content Security Policy restricted to required sources.
- HSTS, X-Content-Type-Options, Referrer-Policy, and appropriate Permissions-Policy.
- No open redirects.
- No arbitrary URL fetches from user input.
- Allowlisted tracking/provider domains.
- Rate limits for authentication, coupon/referral-code attempts, cart mutation abuse, order creation, proof upload, support spam, search scraping, and admin actions.
- Telegram Bot webhook secret-header verification, bot/tenant allowlisting, `update_id` replay deduplication, private-chat enrollment filtering, bounded update parsing, and no raw update/secret in routine logs.
- Rate limits and bounded inputs for Geoapify autocomplete/geocoding/reverse/routing proxies; never forward arbitrary provider parameters or expose the server API key.
- Browser geolocation only after an explicit customer gesture, no background tracking, and no exact address/coordinates in routine logs, analytics, URLs, or error payloads.
- Verified raw-body signatures, replay windows, idempotent provider-event IDs, and amount/currency/order reconciliation for payment-gateway webhooks.
- File magic-byte validation and private storage.
- Tenant authorization on every object lookup, including signed media access.
- Authenticated, tenant-and-scope-authorized queue summaries that expose aggregate values only and cannot be used to enumerate orders or customer data.
- Authenticated order-confirmation/queue-position access restricted to the owning customer or authorized operator; deterministic position computation must not expose adjacent order IDs or PII.
- Field-level encryption for sensitive stored configuration and payment-account data where required.
- Granular field-level permission and redacted audit for Admin customer-name/phone/address copy actions; clipboard contents never enter logs, analytics, audit payloads, or error reports.
- Key versioning and rotation support.
- Append-only application behavior for ledgers, payment events, receipt analyses, risk decisions, and audits.
- Redaction of secrets, raw initData, access codes, full account numbers, full IPs, and unnecessary PII from logs.
- Dependency audit and pinned lockfile.
- No production debug endpoints.
- No default demo operator in production.
- Data retention and anonymization policies.
- Customer export/delete workflow that preserves legally required financial/audit records while anonymizing unnecessary profile data.

Threat-model at least:

- Forged/stale/replayed Telegram initData.
- Spoofed/replayed Telegram Bot webhook updates, forged bot-to-tenant routing, identity duplication, PRIME Member ID collision, and handle-change account confusion.
- Session theft/fixation/replay.
- Admin-code brute force.
- IDOR and tenant data leakage.
- Cart/price/discount/delivery-fee tampering.
- Selected-cart-line tampering, checkout/payment-draft takeover, proof re-parenting, forged VALIDATED classification, and duplicate final submission.
- Client-supplied coordinates/distance, forged route result, stale courier fee config, unavailable courier selection, or manipulated delivery-fee payment timing.
- Malicious default-origin replacement, multiple/defaultless origin race, stale origin version, and unauthorized origin coordinates.
- Inventory oversell/race.
- Duplicate order/payment mutation.
- Proof upload abuse and malware/polyglot files.
- Reused/edited/mismatched receipts.
- Provider webhook spoofing/replay.
- Coupon race/abuse.
- Referral self-use, linked-account farming, cap/budget race, duplicate attribution/reward, and reward-after-refund abuse.
- Fraud analyst/operator privilege abuse.
- Sensitive export.
- Unauthorized or unlogged Admin copying of customer contact/address data and clipboard exfiltration through third-party scripts.
- Queue replay/duplicate delivery.
- Leaked secrets.

Add the threat model and mitigations to docs/security.

## 29. Privacy, digital footprints, and audit

Create a complete application-level digital-footprint system for accountability and investigation. Cloud/provider logs supplement it but do not replace it.

### 29.1 Audit-event contract

Every material event records:

- Tenant.
- Monotonic tenant/partition sequence where the selected datastore supports transactional allocation.
- Actor type: customer, operator, system, scheduled_job, queue_job, provider_webhook, or support process.
- Actor/customer/operator ID and Telegram ID snapshot when relevant.
- Operator role/permission used.
- Source channel: telegram_storefront, admin, pos, api, job, webhook, or migration.
- Session ID/digest reference.
- Store, register, and POS shift when relevant.
- Request/correlation ID and idempotency key when relevant.
- Event category and precise action.
- Target type and target ID.
- Redacted before/after summary or field-level change set.
- Hashes of immutable snapshots/evidence when needed.
- Reason code, justification, approval, and case/amendment link when required.
- Outcome: succeeded, denied, failed, conflicted, reversed, or expired.
- Safe error code, never a secret-bearing raw stack.
- Occurred-at and recorded-at timestamps in UTC.
- Application version/schema version.
- Previous event hash, current event hash, and audit-key version for tamper-evident chaining.

Generate the event hash from a canonical serialized event plus previous hash using a server-held audit integrity key. Use datastore transactions to append and sequence events safely. Create signed/HMAC daily integrity checkpoints and store them separately from the mutable operational record set. Provide an integrity-verification job and report. Do not call this mathematically immutable or use blockchain language; describe it accurately as append-only and tamper-evident.

### 29.2 Required footprint coverage

Audit at minimum:

- Telegram authentication exchange, failure reason code, session creation/rotation/revocation/logout.
- Telegram Bot webhook accepted/rejected/deduplicated outcome, first identity enrollment, PRIME Member ID assignment, and observed profile-name/handle change. Store redacted references and never place the webhook secret or entire raw update in audit.
- Admin-code success/failure/lockout/rotation and recent reauthentication.
- Operator creation, role/permission change, disablement, and owner actions.
- Customer profile/address/consent/tier/flag/block/ban/unban changes.
- Customer-confirmed address/pin change, selected courier, delivery route/quote creation, fee-payment timing, delivery-fee override, collection, reconciliation, delivery-origin create/edit/archive/default switch, and courier availability/config changes. Record redacted references rather than raw address/coordinates in the audit event.
- Product/category/variant/media/price/status changes and bulk/import actions.
- Inventory receipt, reservation, release, sale, adjustment, return, damage, and reconciliation.
- Selected cart-line/cart-version snapshot; cart-to-checkout-to-quote-to-payment-draft-to-proof-analysis-to-order conversion; retained unchecked lines; final submission classification; generated Order No.; and confirmation-snapshot creation. Do not audit every harmless checkbox click as a security event.
- Referral program/code creation, assignment, disable/regenerate, validation outcome reason, provisional/final attribution, qualification, reward issuance, rejection, reversal, and manual decision.
- Every order creation, state transition, order revision, amendment preview/application/rejection, cancellation, return, exchange, and refund obligation.
- POS register/shift open/close, float, cash in/out, variance, held cart, sale, tender, override, void, refund, and printed/delivered receipt.
- Checkout payment draft, payment intent, safe/failed proof upload, analysis start/result/timeout/unavailable reason, immutable VALIDATED/UNVALIDATED submission classification, final linkage to order, settled-draft recovery, reviewer access to sensitive evidence, field correction, approval/rejection, reconciliation, refund, and reversal.
- Static QR image/config upload/replacement/activation, gateway session creation, accepted/rejected webhook reason code, provider settlement transition, missing-proof reminder/escalation, and webhook-versus-proof mismatch.
- Receipt duplicate match, risk signal, fraud case, intervention, appeal, and analyst decision.
- Courier/delivery quote, assignment, dispatch, tracking, attempt, completion, and failure.
- Support ticket assignment, internal/customer reply, attachment access, escalation, and closure.
- Configuration, integration, secret-metadata/key-version, retention, and feature-flag changes without logging secret values.
- Sensitive record views, searches where legally appropriate, bulk actions, reports, exports, and export downloads.
- Every Admin order-detail copy action for customer name, contact number, or delivery address, recording field type and outcome but never the copied value.
- Background job start/retry/failure/dead-letter/recovery and provider webhook acceptance/rejection.
- Notification generation, delivery attempt, outcome, and template version.
- Order-queue policy/threshold/window changes, aggregate rebuild or repair, stale-metric incident, and aggregation job failure/recovery. Do not create an audit event for every read-only monitor poll.
- Migration, seed, deployment version, backup verification, restore drill, and audit-integrity check.

### 29.3 Audit access and retention

- Provide a read-only Audit Explorer with permission-gated search, filters, event detail, related-record navigation, integrity status, and export.
- Audit records have no update/delete application endpoint. Corrections and redactions are new linked events.
- Export requires permission, recent reauthentication, purpose/reason, watermark/metadata, and its own audit event.
- Separate customer-visible activity history from internal security audit.
- Collect only data needed for commerce, delivery, support, security, and legal records.
- Display a versioned privacy notice and consent where required.
- Separate customer-visible notes from internal notes.
- Apply role-based field redaction and mask account/contact details in lists.
- Never log plaintext secrets, access codes, raw Telegram initData, full account/card data, unrestricted IP addresses, or full receipt OCR text indiscriminately.
- If IP/user-agent risk metadata is retained, minimize or HMAC/hash it, document purpose, and apply a short retention policy.
- Define retention per record class. When privacy erasure is required, anonymize unnecessary identity fields while preserving lawful financial/security event integrity and a non-identifying continuity key.

## 30. Performance and mobile quality

Targets measured on representative production-like builds:

- Storefront LCP at or below 2.5 seconds at p75 on a mid-range mobile profile.
- INP at or below 200 ms at p75.
- CLS at or below 0.1.
- Storefront initial compressed JavaScript target at or below 220 KB unless a measured, documented requirement justifies more.
- Admin initial compressed JavaScript target at or below 350 KB; route-level lazy loading required.
- No unbounded catalog/order/customer queries.
- The global queue summary uses a compact aggregate payload and indexed/event-maintained projections; a 15-second active poll must never trigger a full order or payment table scan.

Use:

- Route/code splitting.
- TanStack Query caching with careful invalidation.
- ETag/cache-control for public-within-auth catalog responses, never shared caching for private data.
- Optimized responsive images.
- Lazy loading.
- Skeleton/placeholder dimensions to prevent layout shift.
- Stable 55px header and 35px queue-strip dimensions across loading, data, stale, error, theme, route, and long-count states.
- Stable 44px customer BottomNav and 18px proprietary footer dimensions, with correct customer/Admin bottom content offsets and no route-remount shift.
- Dynamic import of the drop-pin map only on the address step; do not ship the map/routing UI in the initial catalog bundle.
- Exact 300ms cancellable address autocomplete with a three-character floor, bounded 8–10 candidate fetch, Metro Manila/NCR ranking preference, five-result cap, nearby-province retention, deduplication, and short-lived normalized cache to avoid wasteful Geoapify calls.
- Responsive receipt-preview derivatives for the review list, with the full evidence viewer/original fetched only when an authorized reviewer opens the record.
- Cursor pagination.
- Virtualization only for lists large enough to need it.
- Debounced/cancelled search.
- Minimal global state.
- No large charting library unless charts are actually delivered; prefer a compact library or simple accessible summaries.

Test at 320, 360, 390, and 430 CSS pixels, Android Telegram WebView, iOS Telegram WebView where available, and Telegram Desktop. Respect safe areas, keyboard viewport changes, reduced motion, text scaling, dark/light Telegram themes, offline transitions, and back navigation.

At every required mobile width, verify that all five queue blocks and all six BottomNav icons remain inside the viewport without horizontal scrolling, fixed rows do not cover the first/last focusable content, the one-line footer is complete, and only the route body scrolls. Capture loading, populated, high-count, stale, unavailable, keyboard-open, map-open, and receipt-review states; reject any state that changes a fixed row’s height or produces incoherent overlap.

## 31. International-ready behavior

- Externalize interface strings from the beginning.
- Provide English as the complete base locale.
- Keep locale, currency, time zone, date/number format, address fields, phone validation strategy, unit labels, and legal text tenant configurable.
- Do not concatenate translated fragments.
- Support long translated labels without clipping.
- Use Unicode-safe search/normalization.
- Do not assume Philippine postal structure in the schema.
- Do not convert currencies unless a configured rate source and accounting rule exist.
- Keep tax disabled until tenant-specific tax configuration is supplied.

## 32. Testing requirements

### 32.1 Unit/domain tests

Cover:

- PRIME Member ID exact uppercase-alphanumeric length, CSPRNG seam, collision retry/uniqueness, immutability, and stable Telegram-ID mapping across handle changes.
- Money and rounding.
- Charge rules.
- Discount/voucher eligibility, stacking, limits, and concurrency.
- Referral-code normalization/uniqueness, first-order eligibility, promo/referral stacking, self-referral/linked-account flags, cap/budget concurrency, qualification, idempotent voucher reward, and reversal policy.
- The constrained delivery-fee domain policy.
- Courier delivery formula at 0 km, exactly 3.5 km, fractional excess, and above-base distance; optional platform fee, full-route per-kilometer surcharge, night fee across midnight, component rounding, and invalid/negative config rejection.
- PAY AT CHECKOUT versus PAY UPON DELIVERY due-now/due-later/grand-total reconciliation and expected-proof amount.
- Customer tier evaluation.
- State transitions.
- Risk scoring.
- Receipt field normalization and mismatch rules.
- Inventory availability and reservation expiry.
- Quote construction.
- Selected-cart snapshot/digest, no-selected-line rejection, and purchased-line removal without clearing unchecked lines.
- Receipt pre-screen mapping: defined pass → VALIDATED; fail/mismatch/high-risk/inconclusive/timeout/unavailable/invalid schema → UNVALIDATED; neither value grants payment approval.
- Human Order No. tenant-time-zone formatting, same-second collision suffix, uniqueness, idempotent replay, and UTC timestamp preservation.
- POS tender totals, split tender, cash change, shift totals, and variance.
- Order-amendment money delta, payment obligation, inventory delta, and lifecycle restrictions.
- Queue classification by canonical order/payment state, distinct-order counting across multiple proofs, configured POS inclusion/exclusion, and tenant/fulfillment-scope isolation.
- Queue-position 1-based ordering/tie-breaker, both submission classifications included, draft exclusion, ownership isolation, and no adjacent-order disclosure.
- EST. WAIT and EST. DISPATCH sample selection, invalid-timestamp exclusion, arithmetic mean, round-once behavior, empty-sample null, and preservation of original entry/first-transition timestamps.
- ORDER TRAFFIC boundaries at active loads 5, 6, 10, and 11.
- Audit canonicalization, hash chain, sequence, checkpoint, and verifier.

### 32.2 Authentication/security tests

Cover:

- Valid Telegram HMAC fixture.
- Wrong hash.
- Modified field.
- Missing hash.
- Stale auth_date.
- Future auth_date.
- malformed user JSON.
- Oversized Telegram ID handling.
- Valid/invalid Telegram webhook secret header, wrong bot/tenant key, replayed `update_id`, oversized/malformed update, group-update non-enrollment, and private-interaction idempotent enrollment.
- Mini App-first versus bot-first enrollment resolves the same customer/PRIME Member ID; handle/name change appends history rather than creating an account.
- Session expiry/rotation/revocation.
- CSRF.
- Admin allowlist plus access code.
- Case-insensitive code normalization.
- Rate limit/lockout.
- Permission denial.
- Recent reauthentication.
- Cross-tenant access attempts across API, media, export, queue, and analytics.
- POS role/register/shift enforcement and supervisor approvals.
- Audit-event authorization, redaction, append-only behavior, and integrity failure detection.
- Geoapify proxy authentication, tenant/country/scope validation, bounded input, rate limit, secret non-exposure, and exact-location log redaction.
- Valid/invalid card-gateway webhook signature, timestamp, replay, duplicate provider event, wrong amount/currency/order, and secret non-exposure.
- Customer isolation for saved coordinates, delivery quotes, QR media, receipt originals, and notifications.
- Admin customer-detail copy permission denial, cross-tenant/order denial, strict field allowlist, redacted audit payload, no bulk-field response, and no PII in logs/telemetry.

### 32.3 Commerce integration tests

Cover:

- Cross-device active cart.
- Cross-device selected-item checkboxes; checkout of a subset removes only purchased lines and retains unchecked lines unchanged.
- Cart version conflict.
- Price/stock change during checkout.
- Quote expiry.
- Concurrent last-item reservation.
- Order idempotency.
- Same-second Order No. collision produces distinct safe numbers while duplicate idempotency returns the original order.
- Reservation release.
- Coupon final redemption.
- Side-by-side promo/referral checkout values persist across devices, revalidate independently, enter the quote as separate benefits, and snapshot separately on the order.
- Referral order attribution cannot be reassigned by amendment; duplicate qualifying events issue at most one reward voucher; cancellation/refund creates the configured reversal without deleting history.
- Checkout payment-draft/proof/analysis/final-link lifecycle with ownership, quote-version, idempotency, expiry, and orphan/settled-draft recovery.
- Static QR Ph Admin image versioning and customer retrieval through authenticated media access.
- Gateway session plus verified webhook plus mandatory receipt in both arrival orders: webhook-before-proof and proof-before-webhook. Neither browser callback nor proof alone approves the order.
- Confirmed gateway settlement with missing proof remains safely persisted in the Admin payment-draft recovery queue, does not appear in ON QUEUE before final submission, and resumes across devices.
- Delivery proof amount includes the fee for PAY AT CHECKOUT and excludes it for PAY UPON DELIVERY while the grand total remains reconciled.
- Geoapify autocomplete, forward/reverse-geocode, and routing adapter tests use deterministic provider fakes; a Philippines country filter plus configured Metro Manila proximity bias is sent, NCR matches are ranked first without excluding nearby-province candidates, exact 300ms debounce/cancellation works, and only the provider road-distance field reaches the fee calculator.
- Current-location consent/denial/timeout and drop-a-pin reverse-geocode flows retain a manual address path and never accept client-supplied distance.
- Address, pin, courier, payment-timing, night-window, availability, or fee-config changes invalidate the quote and force server requote.
- Multiple delivery origins can be saved; exactly one active default exists per scope; current-default archive is rejected without atomic replacement; a default switch invalidates uncommitted quotes/drafts while submitted order origin snapshots remain unchanged.
- Unavailable couriers stay returned in configured order but cannot be selected; a route failure never produces a guessed fee.
- Customer notification inbox/unread count/read state persist across devices independently of Telegram Bot delivery outcome.
- Duplicate queue delivery.
- Payment approval/rejection transition.
- Dispatch/delivery transition.
- Cancellation/refund inventory effect.
- POS on-behalf order creation through the shared quote/order engine.
- POS split tender and cash-shift reconciliation.
- Held POS cart retrieval without cross-register/tenant leakage.
- Order amendment from preview through approval/application.
- Stale order revision conflict.
- Additional-payment and refund-obligation deltas without rewriting original payment.
- Post-dispatch edit rejection and replacement/return workflow.
- Duplicate background delivery without duplicate audit/order/tender effects.
- Order/payment transitions update the queue projection exactly once despite duplicate event delivery; reconciliation repairs injected drift.
- Both VALIDATED and UNVALIDATED final submissions create `payment_review` orders and increment ON QUEUE exactly once; checkout drafts and analysis retries do not.
- Order amendments do not reset `entered_at`, `first_ready_at`, or `first_dispatched_at`; POS orders affect only the configured shared preparation queue.
- The queue-summary API returns real aggregate data, valid freshness metadata, no PII/order identifiers, and no cross-tenant or cross-scope leakage.

### 32.4 Upload/analysis tests

Use synthetic fixtures only:

- Valid JPEG/PNG/WebP.
- Wrong extension/MIME/magic.
- Oversized file.
- Unsupported SVG.
- Exact duplicate.
- Near duplicate.
- Same reference used twice.
- Amount/date/account mismatch.
- Low OCR confidence.
- Analyzer timeout/invalid schema.
- Customer pre-screen returns UNVALIDATED on fail/inconclusive/timeout/unavailable and still enables final submission after a safe upload; unsafe-file rejection still requires replacement.
- Later Admin re-analysis appends history and cannot rewrite the immutable submission classification.
- Manual fallback.
- Reviewer correction and immutable analysis history.
- Gateway receipt compared with verified provider settlement facts.
- Evidence viewer fit/zoom/pan/rotate/reset/fullscreen/original-access authorization and corrupt-preview fallback.

### 32.5 End-to-end tests

At minimum:

1. Valid Telegram customer browses the three-column catalog, checks selected cart lines, completes the exact 1.0–9.0 flow, receives the final quote, creates/resumes a checkout payment draft, uploads a safe mandatory proof, sees VALIDATED or UNVALIDATED, submits the order, and sees its confirmation/queue status.
2. Outside-Telegram browser sees only the blocking state and cannot call protected APIs.
3. Admin authenticates with allowlisted Telegram identity and bootstrap/test access code, then is forced through the configured security flow.
4. Product created in admin appears in storefront.
5. Inventory adjustment affects availability.
6. Payment reviewer analyzes and approves/rejects proof with reason.
7. Operations packs and dispatches an approved order.
8. Fraud analyst opens a case and applies an expiring intervention.
9. Owner performs a recently reauthenticated ban and unban.
10. Support agent replies to an order-linked ticket.
11. Tenant A cannot discover or access Tenant B data.
12. Store Staff opens a POS shift, selects an existing or walk-in customer, completes a server-authoritative sale, issues a receipt, and closes/reconciles the shift.
13. POS Supervisor approves a configured price/discount override and the digital footprint shows requester, approver, reason, and before/after totals.
14. Authorized Operations staff previews and applies a pre-dispatch order amendment; inventory and payment delta reconcile and the customer sees the new revision.
15. A dispatched/completed order cannot be silently edited and routes to the correct return/replacement/refund workflow.
16. The Audit Explorer shows the complete related event chain and the integrity verifier detects a synthetically altered test event.
17. The greenfield-origin check proves all project files are inside the isolated new root and no external repository was modified.
18. The 55px header and 35px five-block queue strip remain fixed and unclipped at 320/360/390/430px while the content body scrolls; loading, high-count, stale, and unavailable states cause no height or layout shift.
19. VALIDATED and UNVALIDATED fixture submissions both enter payment review and ON QUEUE; an order then progresses through confirmed/preparing, READY, and DISPATCHED; counts and estimates update from first-transition timestamps, and LIGHT/MODERATE/HEAVY boundaries match the exact policy.
20. Exact-300ms address autocomplete ranks Metro Manila/NCR matches ahead while retaining mocked nearby-province matches; USE CURRENT LOCATION and DROP A PIN each reverse-geocode successfully; Geoapify road distance from the active default origin drives the exact base/excess/platform/surcharge/night formula; route failure blocks the quote without a fabricated fee.
21. The customer sees four compact courier tiles per row. An UNAVAILABLE courier remains visible and disabled, an available selection requires PAY AT CHECKOUT or PAY UPON DELIVERY, and every bill/order surface reconciles due-now, due-later, delivery fee, and grand total.
22. A Static QR Ph checkout displays the Admin-uploaded QR, requires a safe receipt and pre-screen before final submission, and renders that receipt clearly in Admin review. A card checkout accepts a valid signed webhook but remains unapproved until its required receipt is uploaded and reviewed; pass/fail can still be submitted, and webhook/receipt mismatch is flagged.
23. All Customer routes show six correctly routed icon-only BottomNav tabs above the exact one-line proprietary footer; Admin/POS shows the footer without that BottomNav. Active state, real cart/unread badges, nested routes, keyboard, safe areas, and 320/360/390/430px snapshots pass.
24. PROMO CODE and REFERRAL CODE remain equal-width and side by side at 320/360/390/430px; valid independent codes produce separate quote/order-breakdown rows, self/ineligible referral is rejected, and the qualifying order issues exactly one configured voucher reward.
25. An authorized Admin copies name, contact number, and complete delivery address independently from Order Detail; each clipboard value is clean, each action creates a redacted audit event, unauthorized/cross-tenant requests fail, and PROMO CODE/REFERRAL CODE remain visible as separate breakdown rows.
26. First private Bot interaction auto-captures Telegram Profile Name, Handle when present, and lossless User ID and generates one immutable 10-character PRIME Member ID; a later handle change preserves the same customer/ID and creates an authorized investigation-history event.
27. Checkout selects only checked cart lines; after submission, those lines are removed while unchecked lines remain cross-device with correct quantities. Receiver fields stay equal side by side in normal acceptance widths, and `FLOOR/UNIT NO./INSTRUCTIONS` renders at three-line height.
28. A passing safe proof submits as VALIDATED and a failing/timeout/unavailable safe proof submits as UNVALIDATED; both enter ON QUEUE and require human review. Unsafe content is rejected before proof acceptance. The confirmation shows reduced-motion-safe animated check, copied `DDMMYYHHMMSS`-base Order No., Queue Position, shared Est. Waiting Time, Order Date & Time, Order No., and Order Amount without exposing another order.
29. Admin saves multiple delivery origins, atomically selects one default, and the customer quote uses that origin for charge and pickup. Switching default invalidates an unsubmitted quote but does not rewrite a submitted order; attempting to archive the only default fails safely.

Capture visual snapshots at the required mobile widths. Inspect them; do not treat generated screenshots as self-validating.

## 33. CI, deployment, and operations

Create CI or the selected build environment’s equivalent checks for:

- Install with frozen lockfile.
- Formatting check.
- Lint.
- Typecheck.
- Unit/integration tests.
- Build all apps.
- Migration/schema validation.
- Dependency/security scan.
- Playwright smoke suite where environment permits.
- Cloudflare D1 migration/schema validation plus Worker binding/configuration validation.
- Audit integrity fixture verification.
- Greenfield-boundary verification that rejects paths outside the recorded project root.

Deployment:

- Preview/local environment.
- Staging with separate resources.
- Production with separate resources.
- Forward-only migrations, with a documented restore/rollback plan.
- Back up or confirm recovery point before destructive production migration.
- Deploy the Cloudflare deployment’s application/services only after checks pass.
- Run post-deploy smoke tests.
- Verify Telegram launch, authentication, catalog, admin/POS authentication, private-object upload, background-job consumption, operational-database write, order amendment, and audit append/integrity check.

Provide exact but non-secret commands/instructions for the Cloudflare deployment:

- Package-manager setup.
- Install.
- Local development.
- Database schema/rules/index migration locally/staging/production.
- Seed demo/staging data.
- Test.
- Build.
- Deploy staging.
- Deploy production.
- Add secrets/configuration through Cloudflare secret/binding configuration and Wrangler; never commit secret values.
- Roll back application version.
- Restore database through the documented provider process.

Do not execute paid-resource creation, DNS changes, bot configuration, or production deployment without explicit authorization. Complete all code/config/docs that can be done safely without those actions.

Do not push branches, open pull requests, merge, or publish releases unless the user explicitly asks. Local version-control checkpoints are allowed only inside NEW_PROJECT_ROOT.

## 34. Credit- and context-efficient implementation protocol

Efficient build-credit use is a product requirement.

- Inspect only the newly created project’s package manifests, directory tree, configuration, and source files in batches.
- Never search other repositories or the device for code, components, styles, fonts, schemas, or configuration to reuse.
- Search within NEW_PROJECT_ROOT before opening project files.
- Read only relevant new-project files, but read them completely when editing them.
- Reuse components and patterns created within this greenfield project; do not copy them from elsewhere.
- Use one coherent stack and one source of truth per concern.
- Implement vertical slices that include schema, API, UI, permission, audit, and focused tests.
- Run targeted tests during a slice. Run full validation at phase gates, not after every tiny edit.
- Do not repeatedly regenerate scaffolding or rewrite stable files.
- Do not add speculative abstractions, placeholder dashboards, duplicate SDK wrappers, or unused dependencies.
- Implement Geoapify only for the requested location capabilities and one card-gateway adapter only; do not spend credits scaffolding alternative map, routing, geocoder, or gateway providers.
- Cache normalized Geoapify lookups/routes briefly, debounce autocomplete exactly once, and reuse one receipt-analysis result per unchanged proof/model/rule version; do not burn provider/build credits on duplicate renders, retries, or speculative analyzers.
- Reuse the shared media upload/viewer pipeline for courier logos, the Static QR image, and payment receipts while preserving their different authorization and retention policies.
- Do not produce long progress essays.
- Do not paste complete generated files into chat when they exist in the workspace.
- If a provider secret is missing, implement and test the adapter boundary, deterministic/manual fallback, configuration validation, and documentation; then continue other unblocked work.
- Keep a concise docs/decisions/build-status.md with completed slices, current migrations, validation results, known blockers, and next work. Update it at phase gates.
- Never claim “enterprise” as a substitute for implementing controls and tests.

### 34.1 ChatGPT operating rules

- Treat `greenfield-origin.md`, `architecture-profile.md`, `build-status.md`, contracts, migrations, state machines, and tests as the external source of truth.
- At the start of each slice, read only the greenfield-origin record, architecture profile, build status, relevant contracts/schema, and files that the slice will change.
- Use one bounded discovery pass inside `NEW_PROJECT_ROOT`. Stop gathering when the exact files/contracts to create or change are known.
- Produce a minimal slice plan of no more than five concrete items, then implement it immediately.
- Keep one in-progress vertical slice at a time.
- Prefer deterministic checklists, schemas, D1 migrations, state-transition tables, and test fixtures over open-ended exploration.
- If validation fails, inspect the failure and its direct dependencies, fix it, and rerun the smallest relevant check. Broaden the search only if the evidence requires it.
- Do not lower the acceptance bar to save context. Handle context/tool limits through smaller slices, persistent status files, and stronger tests.
- Do not spawn sub-agents or duplicate implementations unless the user explicitly requests them.
- Use ChatGPT tools only within the permitted project boundary. Do not inspect unrelated repositories, connected repositories, or device source trees for reusable application code.
- When GitHub is connected, use it only for the user-authorized target repository and only after verifying the repository/worktree boundary. Do not clone/import an existing application to satisfy the greenfield directive.
- Before any external Cloudflare mutation, clearly separate local/code-only work from account-level deployment/resource actions.

### 34.2 Cloudflare operating rules

- Cloudflare is the sole infrastructure profile.
- Use Workers as the application/runtime plane.
- Use D1 as the authoritative relational commerce datastore.
- Use R2 for private objects.
- Use Queues for asynchronous message delivery and Workflows for durable multi-step processes requiring retries, waiting, or human review. Cloudflare Workflows are designed for durable, retryable multi-step execution and can coordinate third-party APIs while keeping orchestration on Cloudflare. citeturn185159search4turn185159search9
- Use Workers AI as the default in-Cloudflare receipt-analysis provider. External AI/OCR is an optional adapter only when explicitly authorized and never a required runtime dependency.
- Use Workers Builds as the default deployment pipeline for GitHub/GitLab-backed source control. Cloudflare documents Workers Builds as its native Git-integrated CI/CD path. citeturn185159search0turn185159search1
- Keep development, staging, and production as separate Cloudflare resource namespaces/environments with separate D1 databases, R2 buckets/prefix policies, Queues/Workflows, secrets, and hostnames as appropriate.
- Do not create paid Cloudflare resources, change DNS, attach production domains, register Telegram webhooks, enable production payment credentials, or deploy to production without explicit user authorization.
- When a required external integration is not configured, implement the Cloudflare-side adapter, validation, deterministic fallback, tests, and documentation, then continue other unblocked work.
- Do not create a second cloud provider dependency to work around a Cloudflare limitation without explicit user approval.

## 35. Build phases and gates

Execute in this order. Continue automatically from one passed phase to the next.

### Phase 0 — Greenfield isolation and architecture baseline

Deliver:

- Resolved NEW_PROJECT_ROOT outside every existing Git worktree.
- Greenfield-origin record and boundary verifier.
- Explicit Cloudflare-only architecture selection.
- New monorepo/workspace scaffold created only inside the empty root.
- Shared TypeScript, lint, format, test, and build configuration.
- Selected profile’s local/staging/production configuration skeleton.
- Architecture, threat model, decision log, and build-status document.

Gate:

- Install and baseline build pass.
- Boundary verification passes.
- No source/template/repository was imported or remixed.
- No file outside NEW_PROJECT_ROOT was created, modified, staged, committed, moved, or deleted.

### Phase 1 — Security, tenancy, and platform foundation

Deliver:

- Selected datastore schema/rules/index foundation and versioned migrations/backfills.
- Tenant context.
- Telegram HMAC validation.
- Secret-verified Telegram Bot webhook, update deduplication/private-interaction enrollment, stable Telegram User ID mapping, immutable 10-character PRIME Member ID, and profile/handle history.
- Telegram-only client gate.
- Customer/operator upsert.
- Server sessions, CSRF, revocation.
- Admin operator allowlist, bootstrap code flow, RBAC.
- Append-only audit service, canonical event contract, hash chain, and integrity-check fixture.
- Cross-tenant tests.
- Error/logging/request-ID framework.

Gate:

- Authentication and isolation suites pass.
- Outside-Telegram test cannot access protected data.
- No secret is in client bundles or repository.
- Bot-first and Mini App-first enrollment fixtures resolve one customer; handle changes preserve PRIME identity.

### Phase 2 — Catalog, storefront, product admin, cart

Deliver:

- Product/category/variant/media schema and APIs.
- Product management UI.
- Inventory foundation.
- Shared global shell with the fixed 55px header and fixed 35px five-block queue strip, authenticated summary query, fixed loading/null/stale dimensions, and no hard-coded metric values.
- White/grey/dark-grey global tokens, the fixed exact proprietary footer, and the fixed 44px six-icon customer BottomNav with real routes, active states, server cart badge, persisted notification inbox/unread badge, and Admin/POS exclusion.
- Three-column mobile storefront.
- Search/filter/product detail.
- Server-backed cross-device cart with per-line checkout checkboxes, batch selection, and retained unchecked lines.

Gate:

- Product created in admin appears in storefront.
- 320/360/390/430 screenshots are readable and unclipped; the fixed 90px top stack, 44px customer BottomNav, 18px one-line footer, safe-area offsets, five queue blocks, six icon tabs, and route-body scrolling pass visual inspection in loading and empty-data states.
- All six customer tabs open their real protected routes; cart and unread badges come from persisted server data; Admin/POS shows only the proprietary footer.
- Cart persistence, selection/subset retention, and version-conflict tests pass.

### Phase 3 — Checkout, inventory, rules, orders

Deliver:

- Checkout session through the immutable 7.0 FINAL BILL boundary, including read-only Telegram/PRIME identity, selective MY SHOPPING CART, required equal-width receiver fields, and the three-line `FLOOR/UNIT NO./INSTRUCTIONS` control.
- Exact-300ms Geoapify autocomplete with Philippines filter, Metro Manila/NCR proximity bias and server ranking boost that retains nearby provinces; forward geocoding, reverse geocoding, current-location, drop-a-pin, and road-routing workflow with secret-safe proxy and provider fake.
- Inventory reservation/ledger.
- Charges.
- Discounts/coupons/vouchers.
- Referral program/code/attribution/reward domain, Admin management, equal side-by-side PROMO CODE/REFERRAL CODE checkout fields, independent quote snapshots, and idempotent qualification/reversal.
- Courier management with visible availability toggles, multiple saved delivery origins, one atomically selected default calculation/pickup origin, strict four-column customer tiles, the sole base/excess/platform/per-km-surcharge/night formula, immutable road-route quote, and required delivery-fee payment timing.
- Immutable quotes.
- Idempotent order-creation/confirmation domain contract, kept unreachable from customer production UI until Phase 4’s mandatory proof and receipt pre-screen are wired.
- Order revision and amendment domain foundation with preview/delta rules.
- Immutable order-entry/first-READY/first-DISPATCHED timestamps, the versioned queue classification policy, event-maintained tenant/queue aggregates, summary endpoint, 15-second active refresh, and scheduled reconciliation.
- Customer order history.
- Base order admin.
- Order Detail promo/referral breakdown plus permission-gated audited copy buttons for customer name, contact number, and delivery address.

Gate:

- Pre-payment checkout (1.0 through 7.0) integration tests pass; no customer can bypass the not-yet-wired proof gate to submit an order.
- Concurrent stock/coupon tests pass.
- Quote and order totals reconcile exactly.
- Order-amendment delta and stale-revision tests pass.
- Promo/referral stacking, self/ineligible referral, attribution immutability, cap concurrency, one-reward idempotency, reversal, copy-field permission/redaction, and equal-field viewport tests pass.
- Geoapify exact-debounce/bias/ranking/nearby-province adapter, multi-origin/default-switch, route-failure, location-permission fallback, fee boundary/rounding, unavailable-courier visibility, requote invalidation, and due-now/due-later reconciliation tests pass.
- Real state-transition fixtures update all five queue-monitor blocks correctly, duplicate events do not double-count, empty samples render no fabricated time, and traffic tests pass at 5/6/10/11.

### Phase 4 — Payments, proof upload, receipt analysis, review

Deliver:

- Payment configuration and intents.
- Persisted checkout payment drafts bound to immutable quote/selection, with settled-abandoned-draft recovery.
- Admin-uploaded/versioned Static QR Ph method and one webhook-driven card-gateway adapter.
- Private Cloudflare object upload.
- Selected-profile background-job pipeline.
- Deterministic receipt analysis.
- Configured analyzer adapter/fallback.
- Review queue and decisions.
- Mandatory safe proof for both QR and card-gateway flows; bounded pre-submit analysis; immutable VALIDATED/UNVALIDATED submission classification; both outcomes allowed to final-submit into `payment_review`/ON QUEUE; separate gateway settlement state; missing-proof draft reminders/recovery; and the complete zoom/pan/rotate/fullscreen Admin evidence viewer.
- Tenant-time-zone `DDMMYYHHMMSS`-base Order No. with safe collision behavior, reduced-motion-safe animated-check confirmation, copy action, persisted five-row confirmation snapshot, and live owner-authorized queue position/status.
- Payment/order transition integration.

Gate:

- Upload security tests pass.
- Exact/near-duplicate and mismatch fixtures route correctly.
- Analyzer fail/inconclusive/timeout/unavailable does not lose a safe proof or block final submission; it yields UNVALIDATED and mandatory manual review. Unsafe proof content is still rejected.
- Valid webhook plus missing proof cannot approve; proof plus missing/failed webhook cannot approve without an authorized reconciliation exception; webhook/proof mismatch routes to review.
- VALIDATED and UNVALIDATED submissions both enter ON QUEUE exactly once, and no checkout/payment draft is counted before final submission.
- Same-second order-number collision, idempotent replay, confirmation table, queue-position ownership, and selected-versus-unchecked cart behavior pass.
- The Admin-uploaded QR and both method receipts render clearly through authenticated media access, and provider replay/signature/amount tests pass.
- No AI result alone auto-bans a customer.

### Phase 5 — Fulfillment, POS, order amendments, customers, tiers, support

Deliver:

- Complete order/fulfillment/delivery workflows.
- PAY UPON DELIVERY fee obligation, dispatch visibility, collection event, exception/waiver control, and reconciliation without rewriting merchandise payment.
- Dynamic permitted actions.
- Stores, registers, POS shifts, cash movements, held carts, tenders, receipts, and supervisor overrides.
- On-behalf POS sale using the shared quote/order/payment/inventory services.
- POS orders enter the correct shared preparation-queue metrics according to explicit store/fulfillment scope; immediate no-preparation counter sales remain excluded.
- Full order-amendment UI, approval, application, payment delta, inventory delta, notification, and revision history.
- Customer management.
- Customer Account referral code copy/Telegram share, pending/qualified counts, issued reward vouchers, and notification linkage without exposing referred-customer PII.
- Customer tier rules/history.
- Support tickets/messages/assignment/SLA.
- Notifications outbox.
- Customer in-app notifications remain authoritative and persisted even when Telegram Bot delivery fails.

Gate:

- Customer-to-operator workflows pass end to end.
- POS sale, split tender, shift reconciliation, void/refund control, and audit tests pass.
- Pre-dispatch amendment succeeds with reconciled deltas; post-dispatch silent edit is denied.
- Permissions and audits are enforced.

### Phase 6 — Fraud cases and interventions

Deliver:

- Risk rules and assessments.
- Fraud case management.
- Evidence timeline and links.
- Holds, restrictions, blocks, ban/unban, appeals.
- Owner recent-reauth gate.
- Reviewer override/false-positive metrics.

Gate:

- Intervention scope/expiry/reversal tests pass.
- Permanent ban requires owner, recent reauth, reason, case/evidence, confirmation, idempotency, session revocation, and audit.

### Phase 7 — Reports, hardening, deployment readiness

Deliver:

- Operational dashboards and CSV exports.
- Queue count/history, wait-time, dispatch-time, traffic classification, sample-size, freshness, and reconciliation/repair reports.
- Delivery-origin/version/road-distance/fee-component/payment-timing/collection reports; Static QR/card-gateway settlement/proof/reconciliation and settled-draft recovery reports; and VALIDATED/UNVALIDATED-to-human-decision quality reports.
- Permission-gated PRIME identity-continuity/profile-change investigation reporting without exposing historical handles in general dashboards.
- Referral conversion/revenue/benefit/reward/budget/reversal/abuse reports and audit drill-down.
- POS/channel, order-amendment, and cash-reconciliation reports.
- Audit Explorer, integrity verifier, and checkpoint report.
- Daily aggregates and reconciliation.
- Performance pass.
- Accessibility pass.
- Complete CI.
- Staging/production configs.
- Runbooks, backup/restore, incident handling.
- OpenAPI sync.
- Final smoke and end-to-end report.

Gate:

- Full test/build pipeline passes or each unavailable external check is explicitly documented.
- No placeholder core screens.
- Deployment checklist identifies only external credentials/resource/DNS/bot actions.

## 36. Acceptance matrix

Before final completion, prove each item:

| Area | Required proof |
| --- | --- |
| Greenfield isolation | Recorded new root outside existing repositories; boundary test; no imported/remixed/copied source |
| Execution profile | Cloudflare-only infrastructure implemented: Workers/D1/R2/Queues/Workflows/Workers AI with no mixed second-cloud runtime, database, storage, or queue stack |
| Telegram-only access | Invalid/missing/stale initData is denied; no protected data loads |
| Telegram/PRIME identity | First verified private Bot/Mini App interaction captures profile name/handle/lossless User ID; one immutable unique 10-character PRIME Member ID survives handle changes with append-only identity history |
| Cross-device persistence | Same Telegram customer sees the same active cart, selected/unchecked lines, checkout draft, and records from a new session |
| Admin security | Allowlisted operator plus code plus RBAC; default bootstrap code cannot remain active for production |
| Global fixed header | 55px content row on all authenticated Storefront/Admin/POS routes; non-scrolling, safe-area aware, no covered content or route-remount shift |
| Order queue monitor | Fixed 35px five-block strip; both submitted VALIDATED/UNVALIDATED payment-review orders counted once; drafts excluded; distinct server-derived counts, exact READY/DISPATCH formulas and 5/6/10/11 traffic boundaries, active-only 15-second refresh, stale/null behavior, POS scope, transition and viewport tests |
| Global theme/footer/navigation | White/grey/dark-grey default; exact Open Sauce SF Semibold proprietary footer on Customer/Admin/POS; six 44px icon-only customer tabs with real routes, active state, persisted cart/unread badges, safe offsets, and viewport tests |
| Three-column storefront | Inspected screenshots at 320, 360, 390, and 430 CSS px |
| Server authority | Tampered client price, fee, discount, stock, or total is rejected/recomputed |
| Data isolation | Automated Tenant A versus Tenant B negative tests |
| Product management | Real create/edit/archive/variant/media/price/inventory flow |
| Typography | Roboto Condensed main default; supplied/licensed Open Sauce SF Semibold required for the 9.5px footer exception; no copied/counterfeit fonts; readable viewport/text-scaling checks |
| Checkout | Exact 1.0–9.0 progression; selected cart-line subset with unchecked retention; Telegram/PRIME and receiver details; immutable quote/reservation; persisted payment/proof draft; pass-or-fail analysis submission; idempotent order creation; conflict handling; and reconciled due-now/due-later/grand-total breakdown |
| Referral system | Separate equal Promo/Referral fields; tenant-unique safe codes; first-order/self-abuse/cap controls; immutable attribution; idempotent voucher reward/reversal; Account/Admin/order breakdown and reports |
| POS | Store/register/shift, customer or walk-in sale, shared server rules, split tender, receipt, cash reconciliation, overrides |
| Order modification | Revisioned preview/approval/application, inventory/payment delta, lifecycle restrictions, original history preserved |
| Payments | Admin-uploaded Static QR Ph plus signed-webhook card gateway; mandatory safe proof for both before submission; recoverable pre-order draft; separate settlement/pre-screen/human-review states; no callback/image-only approval; reconciliation boundary |
| Receipt analysis | Hash/duplicate/OCR/mismatch/risk pipeline; bounded pre-submit result; pass → VALIDATED and every other safe-proof result → UNVALIDATED; both may submit/enter ON QUEUE and require human review; gateway-fact comparison; honest uncertainty; and working high-resolution Admin viewer controls |
| Inventory | Ledger, availability, reservation expiry, concurrency safety |
| Geoapify delivery | Exact-300ms autocomplete with Philippines filter, configured Metro Manila/NCR bias and top-result boost while nearby provinces remain eligible; forward/reverse geocoding, current location, drop pin, provider road route, secret-safe proxy, no guessed-distance fallback, and provider-fake tests |
| Courier/fee rules | Multiple saved coordinate origins with one atomic default used for pickup/calculation and snapshotted per order; four tiles per row; unavailable remains visible; only base fare through 3.5km + excess-km charge + optional platform/per-km surcharge/night fee; exact component and rounding tests |
| Rules | Charges, discounts, and vouchers have previews and tests without adding hidden delivery-calculator components |
| Orders | Valid state transitions, permissions, dynamic actions, dispatch/delivery history, unique tenant-local `DDMMYYHHMMSS`-base number, reduced-motion confirmation, copy action, and secure five-row queue table |
| Admin customer-detail copy | Separate name/phone/address copy controls, exact clean values, field permission, strict server allowlist, redacted per-action audit, no PII telemetry, clipboard fallback tests |
| Customers/tiers | Persisted Telegram/PRIME profile continuity, receiver/address history, tier rules and manual override audit |
| Fraud | Signals, cases, interventions, expiry/reversal, owner-gated ban/unban |
| Support | Customer ticket and admin queue/reply/escalation workflow |
| Digital footprints | Complete material-event coverage, redaction, append-only API, hash chain/checkpoints, integrity verification |
| Analytics | Defined metrics, tenant/time-zone scope, source reconciliation, export audit |
| Reliability | Idempotency, duplicate queue handling, retries, dead-letter path, recovery docs |
| Deployment | CI, migrations, environment separation, secret setup, smoke and rollback instructions |

## 37. Required final handoff format

When implementation is complete or a genuine external blocker stops the work, return:

1. Outcome: what is working now.
2. Architecture: final deployed/deploy-ready shape.
3. Implemented modules: concise checklist.
4. Security controls: authentication, sessions, isolation, admin gate, uploads, audit.
5. Validation: exact commands and pass/fail/skip results.
6. Performance/accessibility: measured results and viewport checks.
7. Deployment: exact remaining external Cloudflare/account/DNS/Telegram/Geoapify/payment configuration steps, if any.
8. Configuration needed: variable names only, never secret values.
9. Known limitations: real limitations, especially receipt-analysis certainty and unconfigured external providers.
10. Changed files: grouped by application/package/docs.
11. Current build-status path and exact next safe action if work must continue.
12. Greenfield proof: resolved project root, Cloudflare deployment, boundary-verification result, and confirmation that no existing repository/source was imported or modified.

Do not report a plan as an implementation. Do not say “production-ready” if migrations, auth tests, isolation tests, core workflows, deployment configuration, or recovery documentation are missing.

## External production inputs the owner will eventually need

The coding agent should keep working without these until the relevant deployment/integration step genuinely needs them:

- Production domain and DNS authority.
- Telegram bot token and bot ID, production webhook URL, and a newly generated high-entropy webhook secret stored only in the platform secret manager.
- Telegram ID of the initial owner.
- Cloudflare account/project access for Cloudflare, or Cloudflare account/project access and permissions for Workers/D1/R2/Queues/Workflows/AI/Workers Builds.
- Final brand assets and store copy.
- Licensed/supplied Open Sauce SF Semibold asset required for the exact global footer; optional licensed Helvetica Neue Condensed or other Open Sauce SF weights only if selected elsewhere. Roboto Condensed remains the main UI default.
- Store/branch/register list, opening-float policy, POS tender methods, receipt details, supervisor thresholds, and cash-reconciliation rules.
- Final Static QR Ph image, destination/account label, customer payment instructions, amount limits, and activation schedule.
- Chosen card-gateway provider, account access, API credentials, webhook signing secret, approved callback/webhook domains, supported currencies, and provider test account.
- Geoapify server API key, optional separately restricted browser map key, approved origins/referrers/CORS/API restrictions, quota/plan, attribution requirements, operating-country code, preferred Metro Manila/NCR search-bias point/aliases, and nearby-province eligibility/service-area policy.
- Courier names/logos, availability, multiple named delivery-origin coordinates and initial default origin, route mode, base fare/base distance, excess-per-kilometer rate, optional platform fee, optional full-route per-kilometer surcharge, night fee/window, and upon-delivery collection permission.
- Referral program dates, eligible referrer/referred-customer rule, first-order definition, referred-customer benefit, qualifying order state, referrer voucher reward/expiry, stacking, caps/budget, delay, and cancellation/refund reversal policy.
- Receipt OCR/multimodal provider and secret, if automated extraction is enabled.
- Privacy policy, return/refund policy, and jurisdiction-specific tax/legal rules.
- Error-monitoring destination, if used.

## Cloudflare-only infrastructure interpretation

“Entire system must be inside Cloudflare” means every application runtime, API, database, object store, asynchronous job, durable workflow, AI execution, secrets/configuration, edge-security layer, and production observability component is implemented with Cloudflare services.

The following external systems are allowed only as unavoidable business integrations:

- Telegram Bot API / Telegram Mini App.
- Geoapify location/routing services.
- One configured card-payment gateway.
- GitHub solely as source control and repository hosting, where authorized.

No external cloud compute, managed database, object storage, job queue, background runtime, AI runtime, analytics SaaS, or error-monitoring SaaS is required for normal operation. Cloudflare remains the authoritative application platform.

## Important security interpretations

1. COREADMIN1991 is preserved as requested, but only as a bootstrap secret. A publicly known permanent access code cannot be the sole gate of an enterprise admin panel.
2. “Cannot be opened outside Telegram” is implemented as “cannot authenticate, access protected data, or use the app outside a valid Telegram Mini App session.” A static blocking shell may still be downloadable from its web URL.
3. Receipt-image analysis produces evidence and risk signals, not mathematical proof of authenticity. Verified provider settlement and human review remain authoritative.
4. “Serverless 24/7” removes operator-managed servers; it does not create a literal 100% uptime guarantee. Production monitoring, paid limits/SLA where needed, backups, and recovery procedures are still required.
5. “Greenfield from scratch” is strict: the builder must work in a new isolated root and must not inspect, import, copy, or modify existing application source. If the available workspace is an existing repository, the build must pause before the first project write.
6. “Full edit order” is implemented through revisions and amendments. Paid, dispatched, or completed history is never overwritten.
7. “Full digital footprints” means complete material-action coverage with privacy-aware redaction, append-only records, and tamper-evident verification—not logging passwords, secrets, every keystroke, or unnecessary personal data.
8. Geoapify road-route distance is the normal fee basis. Current-location coordinates and dropped pins identify a destination; they do not authorize continuous tracking, client-calculated distance, or a guessed fee when routing fails.
9. Mandatory receipt upload for card-gateway payments creates a uniform evidence workflow but does not replace the signed webhook. Verified provider settlement and receipt review remain separate, and both gates must be satisfied before normal approval.
10. PAY UPON DELIVERY changes when the delivery fee is collected, not the order grand total. It creates a separate outstanding delivery-fee obligation that must be collected or explicitly resolved and reconciled.
11. “Font size 1.5 smaller” is implemented as 1.5 CSS pixels below the 11px tested micro-label minimum: 9.5px for the non-interactive one-line footer only. The six BottomNav targets remain 44px high for usable touch access.
12. PROMO CODE and REFERRAL CODE are separate optional checkout inputs and separate Order Detail breakdown rows. Referral rewards reuse vouchers; there is no cash wallet, multi-level scheme, or silent reassignment after order creation.
13. Admin copy controls return only the requested authorized order-snapshot field and audit the field type, never the value. Delivery-address copy excludes coordinates, provider metadata, risk/internal notes, and unrelated customer data.
14. PRIME Member ID/Internal Customer ID is one immutable, random, unique 10-character uppercase alphanumeric identifier tied to the stable tenant/bot/Telegram User ID record. A username/handle is mutable metadata and never the account key; observed changes are retained only when actually seen in a verified interaction.
15. `VALIDATED`/`UNVALIDATED` is an immutable submission-time receipt-risk pre-screen classification—not proof of authenticity, provider settlement, payment approval, order confirmation, or fulfillment clearance. Any safe proof may proceed under either label; both resulting orders start in `payment_review`, enter ON QUEUE, and require Admin review.
16. Mandatory proof is uploaded to a persisted checkout payment draft before order creation. Unsafe content is rejected, but analyzer failure is converted to UNVALIDATED rather than trapping the customer. A verified gateway settlement on an unsubmitted draft is retained for recovery and is not counted as an order.
17. The requested `DDMMYYHHMMSS` Order No. is generated from tenant-local entry time. Because production can accept more than one order per second, the base remains exact and only a same-second collision receives a deterministic `-NN` suffix; the internal UUID/ULID and UTC timestamp remain authoritative.
18. Metro Manila is a search-ranking preference, not a delivery boundary. Use Philippines filtering, a configured proximity bias, and an NCR metadata boost; do not filter out nearby provinces or alter provider address facts.
19. Courier charge/pickup origin comes from the one Admin-selected active default among saved coordinate origins. The quote/order snapshots its version; a later default switch invalidates only unsubmitted affected quotes and never rewrites order history.

## Official implementation references

- Telegram Mini Apps and initData validation: https://core.telegram.org/bots/webapps
- Telegram Bot API, webhook secret token, updates, and User fields: https://core.telegram.org/bots/api
- Telegram Bot platform overview and user-initiated interaction model: https://core.telegram.org/bots
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare R2: https://developers.cloudflare.com/r2/
- Cloudflare Queues: https://developers.cloudflare.com/queues/
- Cloudflare Workflows: https://developers.cloudflare.com/workflows/
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/
- Cloudflare Workers Builds / CI/CD: https://developers.cloudflare.com/workers/ci-cd/
- Cloudflare Access with Workers: https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- Cloudflare Versions and Deployments: https://developers.cloudflare.com/workers/versions-and-deployments/
- Geoapify Address Autocomplete API: https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/
- Geoapify Forward Geocoding API: https://apidocs.geoapify.com/docs/geocoding/forward-geocoding/
- Geoapify Reverse Geocoding API: https://apidocs.geoapify.com/docs/geocoding/reverse-geocoding/
- Geoapify Routing API: https://apidocs.geoapify.com/docs/routing/

## 38. Start now

Read this entire directive through `MASTER DIRECTIVE END` before the first project write. Do not inspect any existing application repository or source tree. First perform the no-write greenfield preflight in Section 1. If the active workspace is not empty or lies inside an existing Git worktree, stop before creating anything and ask for a new empty workspace. Otherwise, resolve NEW_PROJECT_ROOT, record the Cloudflare-only architecture and greenfield origin, state the first concrete implementation slice in no more than two sentences, and immediately execute Phase 0 through the remaining phases. Make in-scope changes only inside the new root and run non-destructive validation without repeatedly asking permission.

# MASTER DIRECTIVE END
