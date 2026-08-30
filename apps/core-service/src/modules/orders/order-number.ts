const PARTS = ["day", "month", "year", "hour", "minute", "second"] as const;

export const ORDER_NUMBER_TIME_ZONE = "Asia/Manila";
export const ORDER_NUMBER_LENGTH = 12;

function partsFor(date: Date): Record<(typeof PARTS)[number], string> {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: ORDER_NUMBER_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  return Object.fromEntries(
    parts.filter((part) => PARTS.includes(part.type as (typeof PARTS)[number])).map((part) => [part.type, part.value]),
  ) as Record<(typeof PARTS)[number], string>;
}

export function generateOrderNumber(date = new Date()): string {
  const parts = partsFor(date);
  const value = `${parts.day}${parts.month}${parts.year}${parts.hour}${parts.minute}${parts.second}`;
  if (!/^\d{12}$/.test(value)) throw new Error("order_number_generation_failed");
  return value;
}

export function isValidOrderNumber(value: string): boolean {
  return /^\d{12}$/.test(value);
}
