# Order Management Implementation

The Admin order panel is state-driven. It renders only the actions allowed by the current `workflow_state`.

- REVIEW: PAYMENT_CONFIRMED, PAYMENT_FAILED, REJECT_ORDER
- PAYMENT_CLEARED: START_PACKING
- PACKING: READY
- READY: AWAITING_RIDER
- AWAITING_RIDER: DISPATCH
- DISPATCHED: DELIVER
- PAYMENT_FAILED: HOLD_ORDER, REQUEST_RESUBMIT, REJECT_ORDER
- HOLD_ORDER: PAYMENT_CLEARED, REJECT_ORDER
- AWAITING_RECEIPT_RESUBMISSION: PAYMENT_CONFIRMED, PAYMENT_FAILED, REJECT_ORDER
- DELIVERED, REJECTED, CANCELLED: no actions

Dispatch requires a tracking URL and enforces HTTPS through the existing order workflow validator.
Customer order views are Telegram-session protected and expose order details, workflow timeline, and tracking only after dispatch.
