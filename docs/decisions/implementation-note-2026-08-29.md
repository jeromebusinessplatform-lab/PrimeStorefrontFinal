# Implementation Note — 2026-08-29

Applied the single-instance admin override to the greenfield repository.

Repository changes made before commerce implementation:
- Added forward migration `0002_single_instance_admin.sql`.
- Added Admin Access Code normalization/verifier/session-cookie primitives.
- Added Telegram webhook secret boundary and update-id normalization.
- Added immutable PRIME Member ID generator/validator.
- Added Telegram-only storefront authentication boundary.
- Added GitHub Actions CI for install, typecheck, test, and build.
- Updated README/build-status and recorded ADR-0001.

The remaining validation gate is the actual GitHub Actions run. Production Cloudflare resources and external credentials remain intentionally untouched.
