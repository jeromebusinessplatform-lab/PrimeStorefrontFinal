import { describe, expect, it } from "vitest";
import { generateOrderNumber, isValidOrderNumber } from "./order-number";

describe("order number", () => {
  it("formats timestamps in Asia/Manila as DDMMYYHHMMSS", () => {
    const value = generateOrderNumber(new Date("2026-08-30T04:35:45.000Z"));
    expect(value).toBe("300826123545");
    expect(isValidOrderNumber(value)).toBe(true);
  });

  it("handles the Manila date boundary", () => {
    expect(generateOrderNumber(new Date("2026-08-30T15:59:59.000Z"))).toBe("310826075959");
    expect(generateOrderNumber(new Date("2026-08-30T16:00:00.000Z"))).toBe("310826080000");
  });

  it("rejects malformed order numbers", () => {
    expect(isValidOrderNumber("30082612354")).toBe(false);
    expect(isValidOrderNumber("3008261235450")).toBe(false);
    expect(isValidOrderNumber("DDMMYYHHMMSS")).toBe(false);
  });
});
