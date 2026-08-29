const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const PRIME_MEMBER_ID_LENGTH = 12;

export function generatePrimeMemberId(): string {
  const result: string[] = [];
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  let index = 0;
  while (result.length < PRIME_MEMBER_ID_LENGTH) {
    const value = bytes[index % bytes.length];
    index += 1;
    if (value >= 252) continue;
    result.push(ALPHABET[value % ALPHABET.length]);
  }

  return result.join("");
}

export function isValidPrimeMemberId(value: string): boolean {
  return new RegExp(`^[A-Z0-9]{${PRIME_MEMBER_ID_LENGTH}}$`).test(value);
}
