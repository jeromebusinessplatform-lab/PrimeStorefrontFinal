import { describe, expect, it } from "vitest";
import { generatePrimeMemberId, isValidPrimeMemberId } from "./prime-member-id";

describe("PRIME Member ID", () => {
  it("generates exactly twelve uppercase alphanumeric characters", () => {
    const value = generatePrimeMemberId();
    expect(value).toMatch(/^[A-Z0-9]{12}$/);
    expect(value).toHaveLength(12);
    expect(isValidPrimeMemberId(value)).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(isValidPrimeMemberId("short")).toBe(false);
    expect(isValidPrimeMemberId("ABCDEFGHIJKL!")) .toBe(false);
    expect(isValidPrimeMemberId("ABCDEFGHIJK1" )).toBe(true);
  });
});
