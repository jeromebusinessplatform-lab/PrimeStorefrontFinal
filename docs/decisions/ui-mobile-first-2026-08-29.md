# UI/UX Override — 2026-08-29

The Admin and Storefront application surfaces are optimized for mobile phones, not tablets or iPads.

## Constraints

- Use compact components and controls.
- Prefer stacked Admin controls and cards.
- Vertical scrolling is the primary navigation pattern.
- Do not introduce table-based configurators that require horizontal scrolling on phone screens.
- Admin Panel must be available in a native Android APK surface as well as the browser surface.
- The APK renders the same deployed Admin web surface so authentication and authorization remain server-side and there is one Admin UI source of truth.

## Android surface

`apps/admin/android` contains the Android WebView shell. The Admin URL is supplied at build time with the Gradle `adminUrl` property; no credentials or access codes are embedded in the APK.

## Validation status

Responsive CSS and Android project scaffolding are committed. Actual Android release assembly remains a CI validation gate until the workflow executes successfully.
