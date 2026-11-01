/** Name and size in milliseconds of each duration unit, largest first. */
export const DURATION_UNITS = [
  { name: "d", factor: 86_400_000 },
  { name: "h", factor: 3_600_000 },
  { name: "m", factor: 60_000 },
  { name: "s", factor: 1_000 },
  { name: "ms", factor: 1 },
] as const;

/**
 * Match one part: digits, then a unit. The `ms` alternative comes before `m`.
 * The first part starts at the text start. Each later part follows zero or more
 * spaces that come right after the unit of the part before.
 */
const PART_PATTERN = /(?:^|(?<=[dhms]) *)(\d+)(ms|[dhms])/y;

/**
 * Parse a duration text such as `1h30m` into milliseconds.
 *
 * Current behavior: the function reads the parts in order. Each part is
 * digits followed by one unit. One or more spaces (U+0020) can separate two
 * parts. A space before the first part, after the last part, or inside a part
 * is not a separator. The function stops at the first position where no part
 * matches and returns the sum so far.
 *
 * @param text - The duration text.
 * @returns The duration in milliseconds.
 */
export function parseDuration(text: string): number {
  const pattern = new RegExp(PART_PATTERN);
  let total = 0;
  for (let match = pattern.exec(text); match !== null; match = pattern.exec(text)) {
    const unit = DURATION_UNITS.find((candidate) => candidate.name === match[2]);
    if (unit === undefined) {
      break;
    }
    total += Number(match[1]) * unit.factor;
  }
  return total;
}
