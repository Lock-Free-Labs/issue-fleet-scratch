/**
 * Parse a duration text such as `1h30m` into milliseconds.
 *
 * Current behavior: the function reads the parts in order. Each part is
 * digits followed by one unit. It stops at the first position where no part
 * matches and returns the sum so far.
 *
 * @param text - The duration text.
 * @returns The duration in milliseconds.
 */
export function parseDuration(text: string): number {
  void text;
  return Number.NaN;
}
