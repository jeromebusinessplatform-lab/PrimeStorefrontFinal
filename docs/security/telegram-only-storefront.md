# Telegram-Only Storefront Security Boundary

Protected storefront APIs require a server session created from verified Telegram Mini App `initData`.

A direct browser request without verified Telegram identity is unauthenticated. The HTML shell may be retrieved by a browser only to render a blocking “Open this app in Telegram” state; it must not expose protected catalog, pricing, cart, customer, order, payment, or POS data.

Authentication must never trust `initDataUnsafe` or the browser User-Agent. Verification occurs server-side using the documented Telegram HMAC procedure before issuing a session.
