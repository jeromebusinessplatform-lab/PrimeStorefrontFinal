import { describe, expect, it } from "vitest";
import { generatePrimeMemberId, isValidPrimeMemberId } from "./prime-member-id";

describe("PRIME Member ID", () => {
  it("generates exactly ten uppercase alphanumeric characters", () => {
    const value = generatePrimeMemberId();
    expect(value).toMatch(/^[A-Z0-9]{10}$/);
    expect(isValidPrimeMemberId(value)).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(isValidPrimeMemberId("short")).toBe(false);
    expect(isValidPrimeMemberId("abcdefghij")).toBe(false);
    expect(isValidPrimeMemberId("ABCDEFGHI!")).toBe(false);
  });
});
