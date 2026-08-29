# Delivery Fee Integration — 2026-08-29

The customer checkout uses Geoapify for address autocomplete and road-route distance/time, with the resulting route data treated as server-authoritative input for delivery-fee calculation.

## Fee policy

- Base fee: PHP 50
- Normal delivery: PHP 15/km
- Same-Day delivery: PHP 22/km
- Express delivery: PHP 30/km
- Express rush surcharge: PHP 40 when estimated travel time is greater than 30 minutes
- Minimum delivery fee: PHP 80

The customer does not submit a final delivery-fee amount. The server calculates the fee from the selected delivery speed and Geoapify route result.

## Address flow

1. Customer types a delivery address.
2. Geoapify Address Autocomplete returns suggestions.
3. Customer selects a suggestion.
4. The selected formatted address and coordinates are stored in the checkout state.
5. The server uses the stored coordinates as the destination for the route calculation.

## Receipt analysis

Taggun simple receipt extraction runs after the payment receipt upload. Its output is enrichment/analysis metadata only. A successful, failed, unavailable, or low-confidence Taggun result must not by itself block order submission.

The actual payment review/approval workflow remains a separate business decision after submission.

## External API references

- Geoapify Address Autocomplete: https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/
- Geoapify Routing API: https://apidocs.geoapify.com/docs/routing/
- Taggun API Reference: https://developers.taggun.io/reference/overview
