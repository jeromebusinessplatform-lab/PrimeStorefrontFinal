# Checkout Flow Override — 2026-08-29

The authoritative checkout flow is:

1. Customer selects products.
2. Customer reviews the cart and proceeds to Checkout.
3. Customer enters Receiver Name, Contact Number, and Delivery Address. Address suggestions are provided by the Geoapify Address Autocomplete API; the selected structured result may include formatted address and coordinates.
4. Customer selects a delivery provider and the payment method for the delivery fee.
5. Customer reviews the complete order and proceeds to payment.
6. Customer uploads a payment receipt. Taggun receipt analysis is asynchronous/enrichment-oriented and is never a submission blocker. A failed, unavailable, low-confidence, or negative analysis result must not prevent the customer from submitting the order.
7. Customer submits the order.

## Invariants

- Receiver details are stored as part of the checkout/order snapshot.
- Delivery provider, fee amount/currency, and delivery-fee payment method are server-authoritative checkout data.
- Order totals and inventory are computed/validated server-side.
- Receipt analysis is recorded independently from submission state.
- Taggun credentials are server-side secrets only; they are never embedded in the Telegram Mini App.
- A receipt-analysis failure must still allow order submission, subject to other ordinary checkout validation.

## External contracts

Geoapify Address Autocomplete is an address-suggestion/validation dependency. Taggun's documented simple receipt endpoint accepts a multipart file upload and returns structured receipt fields; its current API uses an `apikey` header. Treat Taggun as an external live API and keep it behind the Core Service.
