import { describe, expect, it } from "vitest";
import { normalizeTelegramUpdateId, verifyTelegramWebhookSecret } from "./telegram-webhook";

describe("Telegram webhook boundary", () => {
  it("requires the configured secret", () => {
    expect(verifyTelegramWebhookSecret("secret", "secret")).toBe(true);
    expect(verifyTelegramWebhookSecret("secret", "wrong")).toBe(false);
    expect(verifyTelegramWebhookSecret("secret", null)).toBe(false);
  });

  it("accepts lossless numeric update ids", () => {
    expect(normalizeTelegramUpdateId("9223372036854775807")).toBe("9223372036854775807");
    expect(normalizeTelegramUpdateId("not-an-id")).toBeNull();
  });
});
