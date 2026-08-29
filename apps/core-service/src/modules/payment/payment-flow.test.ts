import { describe, expect, it } from "vitest";
import { analyzeReceipt, assertSafeProof, buildOrderNumber, canFinalizeWithoutProof, serializeQuoteSnapshot } from "./payment-flow";

describe("Sprint 4 payment proof boundary", () => {
  it("rejects unsafe proof media and oversized payloads", () => {
    expect(() => assertSafeProof({ mediaType: "text/html", sizeBytes: 10, sha256: "a".repeat(64) })).toThrow("proof_media_type_not_allowed");
    expect(() => assertSafeProof({ mediaType: "image/png", sizeBytes: 10 * 1024 * 1024 + 1, sha256: "a".repeat(64) })).toThrow("proof_size_invalid");
  });

  it("routes duplicate and mismatch proofs to UNVALIDATED manual review", () => {
    const base = { mediaType: "image/png", sizeBytes: 1024, sha256: "a".repeat(64), expectedAmountMinor: 12000 };
    expect(analyzeReceipt(base, true).status).toBe("unvalidated");
    expect(analyzeReceipt({ ...base, extractedAmountMinor: 12001 }).status).toBe("unvalidated");
    expect(analyzeReceipt({ ...base, providerStatus: "timeout" }).status).toBe("unvalidated");
  });

  it("validates safe proof when deterministic precheck passes", () => {
    expect(analyzeReceipt({ mediaType: "image/jpeg", sizeBytes: 1024, sha256: "b".repeat(64), expectedAmountMinor: 12000, extractedAmountMinor: 12000, providerStatus: "ok" }).status).toBe("validated");
  });

  it("never permits payment submission without proof", () => {
    expect(canFinalizeWithoutProof("qr_ph")).toBe(false);
    expect(canFinalizeWithoutProof("card_gateway")).toBe(false);
  });

  it("creates a stable quote snapshot with selected-line retention", () => {
    const { json, fingerprint } = serializeQuoteSnapshot({ checkoutSessionId: "checkout-1", customerId: "customer-1", currency: "PHP", subtotalMinor: 10000, deliveryFeeMinor: 1500, discountMinor: 0, totalMinor: 11500, selectedLineIds: ["b", "a"], deliveryQuoteVersion: 3 });
    expect(json).toContain('"selectedLineIds":["a","b"]');
    expect(fingerprint).toBe(json);
  });

  it("formats tenant-local order numbers as DDMMYYHHMMSS", () => {
    const value = buildOrderNumber(new Date("2026-08-30T00:00:00.000Z"), "Asia/Manila");
    expect(value).toMatch(/^300826080000$/);
  });
});
