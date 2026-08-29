const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const PRIME_MEMBER_ID_LENGTH = 10;

export function generatePrimeMemberId(): string {
  const result: string[] = [];
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  let index = 0;
  while (result.length < PRIME_MEMBER_ID_LENGTH) {
    const value = bytes[index % bytes.length];
    index += 1;
    if (value >= 252) continue; // unbiased 36-symbol selection: 252 is divisible by 36
    result.push(ALPHABET[value % ALPHABET.length]);
  }

  return result.join("");
}

export function isValidPrimeMemberId(value: string): boolean {
  return /^[A-Z0-9]{10}$/.test(value);
}
