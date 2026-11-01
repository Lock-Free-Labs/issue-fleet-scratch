/** Name and size in milliseconds of each duration unit, largest first. */
export const DURATION_UNITS = [
  { name: "d", factor: 86_400_000 },
  { name: "h", factor: 3_600_000 },
  { name: "m", factor: 60_000 },
  { name: "s", factor: 1_000 },
  { name: "ms", factor: 1 },
] as const;

/** Match one part at the current position: digits, then letters. */
const PART_PATTERN = /(\d+)([A-Za-z]*)/y;

/** Match zero or more spaces (U+0020) between two parts. */
const SPACES_PATTERN = / */y;

/**
 * Make the error for a text that is not a valid duration.
 *
 * @param text - The text that the function refused.
 * @param reason - A short reason that is true for the text.
 * @param ErrorType - The error class to make. The default is `SyntaxError`.
 * @returns An error of type `ErrorType` whose message names the text.
 */
function invalidDuration<E extends Error = SyntaxError>(
  text: string,
  reason: string,
  ErrorType: new (message: string) => E = SyntaxError as new (message: string) => E,
): E {
  return new ErrorType(`Invalid duration ${JSON.stringify(text)}: ${reason}`);
}

/**
 * Parse a duration text such as `1h30m` into milliseconds.
 *
 * Grammar: `part ( spaces part )*`. A `spaces` item is zero or more spaces
 * (U+0020). A `part` is one or more ASCII digits, directly followed by a unit
 * name from `DURATION_UNITS`. The text holds at least one part. The units
 * come in the table order `d`, `h`, `m`, `s`, `ms`, and each unit occurs at
 * most one time. A space before the first part, after the last part, or
 * inside a part is not accepted, and neither is a tab.
 *
 * @param text - The duration text.
 * @returns The duration in milliseconds.
 * @throws {SyntaxError} If the text does not follow the grammar. The message
 * names the text and gives the reason.
 * @throws {RangeError} If the text follows the grammar, but the sum is more
 * than `Number.MAX_SAFE_INTEGER` milliseconds. A `SyntaxError` has priority
 * over a `RangeError`.
 */
export function parseDuration(text: string): number {
  if (text === "") {
    throw invalidDuration(text, "no duration");
  }
  const partPattern = new RegExp(PART_PATTERN);
  const spacesPattern = new RegExp(SPACES_PATTERN);
  let total = 0;
  let previousIndex = -1;
  let position = 0;
  while (position < text.length) {
    partPattern.lastIndex = position;
    const match = partPattern.exec(text);
    if (match === null) {
      throw invalidDuration(text, `unexpected character at position ${position}`);
    }
    const [, digits, letters] = match;
    if (letters === "") {
      throw invalidDuration(text, "a number without a unit");
    }
    const index = DURATION_UNITS.findIndex((candidate) => candidate.name === letters);
    if (index === -1) {
      throw invalidDuration(text, `unknown unit ${JSON.stringify(letters)}`);
    }
    const unit = DURATION_UNITS[index];
    if (index === previousIndex) {
      throw invalidDuration(text, `the unit ${JSON.stringify(unit.name)} occurs two times`);
    }
    if (index < previousIndex) {
      throw invalidDuration(
        text,
        `the unit ${JSON.stringify(unit.name)} comes after ${JSON.stringify(DURATION_UNITS[previousIndex].name)}`,
      );
    }
    total += Number(digits) * unit.factor;
    previousIndex = index;
    position = partPattern.lastIndex;
    spacesPattern.lastIndex = position;
    spacesPattern.exec(text);
    const next = spacesPattern.lastIndex;
    if (next < text.length) {
      position = next;
    } else if (next > position) {
      throw invalidDuration(text, `unexpected character at position ${position}`);
    }
  }
  if (!Number.isSafeInteger(total)) {
    throw invalidDuration(
      text,
      "the value is more than Number.MAX_SAFE_INTEGER milliseconds",
      RangeError,
    );
  }
  return total;
}

/**
 * Format a number of milliseconds as text. This is a stub: it gives an empty
 * text for each value.
 *
 * @param ms - The duration in milliseconds.
 * @returns The duration text.
 */
export function formatDuration(ms: number): string {
  void ms;
  return "";
}
