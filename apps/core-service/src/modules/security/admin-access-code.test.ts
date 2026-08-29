import { describe, expect, it } from "vitest";
import { normalizeAdminAccessCode, deriveAdminVerifier, verifyAdminAccessCode } from "./admin-access-code";

describe("admin access code", () => {
  it("normalizes NFKC, whitespace, and case", () => {
    expect(normalizeAdminAccessCode("  coreadmin1991  ")).toBe("COREADMIN1991");
  });

  it("round-trips a generated verifier", async () => {
    const salt = new TextEncoder().encode("prime-test-salt");
    const verifier = await deriveAdminVerifier("CoreAdmin1991", salt, 1_000);
    await expect(verifyAdminAccessCode(" coreadmin1991 ", verifier, salt, 1_000)).resolves.toBe(true);
    await expect(verifyAdminAccessCode("WRONG", verifier, salt, 1_000)).resolves.toBe(false);
  });
});
