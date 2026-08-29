export const CHECKOUT_STEPS = [
  "cart_review",
  "receiver_details",
  "delivery_selection",
  "order_review",
  "payment",
  "submitted",
] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export interface ReceiverDetails {
  name: string;
  contactNumber: string;
  addressText: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeliverySelection {
  provider: string;
  feeAmount: number;
  feeCurrency: string;
  paymentMethod: string;
}

export interface ReceiptAnalysisOutcome {
  status: "pending" | "analyzed" | "failed";
  result?: unknown;
}

export function canSubmitAfterReceiptAnalysis(outcome: ReceiptAnalysisOutcome): true {
  void outcome;
  // Taggun is enrichment only. Its result must never block order submission.
  return true;
}

export function assertReceiverDetails(details: ReceiverDetails): ReceiverDetails {
  if (!details.name.trim()) throw new Error("receiver_name_required");
  if (!/^[0-9+()\-\s]{7,25}$/.test(details.contactNumber.trim())) throw new Error("receiver_contact_invalid");
  if (!details.addressText.trim()) throw new Error("delivery_address_required");
  return Object.freeze({ ...details, name: details.name.trim(), contactNumber: details.contactNumber.trim(), addressText: details.addressText.trim() });
}

export function assertDeliverySelection(selection: DeliverySelection): DeliverySelection {
  if (!selection.provider.trim()) throw new Error("delivery_provider_required");
  if (!Number.isInteger(selection.feeAmount) || selection.feeAmount < 0) throw new Error("delivery_fee_invalid");
  if (!selection.feeCurrency.trim()) throw new Error("delivery_fee_currency_required");
  if (!selection.paymentMethod.trim()) throw new Error("delivery_fee_payment_method_required");
  return Object.freeze({ ...selection, provider: selection.provider.trim(), feeCurrency: selection.feeCurrency.trim(), paymentMethod: selection.paymentMethod.trim() });
}
