/** Name and size in milliseconds of each duration unit, largest first. */
const DURATION_UNITS = [
  { name: "d", factor: 86_400_000 },
  { name: "h", factor: 3_600_000 },
  { name: "m", factor: 60_000 },
  { name: "s", factor: 1_000 },
  { name: "ms", factor: 1 },
] as const;

/** The units that `formatDuration` uses: all units of the table except the last one (`ms`). */
const FORMAT_UNITS = DURATION_UNITS.slice(0, -1);

/** The smallest unit of the table (`ms`). */
const SMALLEST_UNIT = DURATION_UNITS[DURATION_UNITS.length - 1];

/** The smallest unit that `formatDuration` uses (`s`). Its text is the result for zero. */
const SMALLEST_FORMAT_UNIT = FORMAT_UNITS[FORMAT_UNITS.length - 1];

/** Match one part at the current position: digits, then letters. */
const PART_PATTERN = /(\d+)([A-Za-z]*)/y;

/** Match zero or more spaces (U+0020) between two parts. */
const SPACES_PATTERN = / */y;

/**
 * Make the error for a text that is not a valid duration.
 *
 * @param text - The text that the function refused. It can also be a number in
 * text form, such as `String(ms)`.
 * @param reason - A short reason that is true for the text.
 * @param ErrorType - The error class to make. The default is `SyntaxError`.
 * @returns An error of type `ErrorType` whose message names the text.
 */
function invalidDuration(
  text: string,
  reason: string,
  ErrorType: new (message: string) => Error = SyntaxError,
): Error {
  return new ErrorType(`Invalid duration ${JSON.stringify(text)}: ${reason}`);
}

/**
 * Parse a duration text such as `1h30m` into milliseconds.
 *
 * Grammar: `part ( spaces part )*`. A `spaces` item is zero or more spaces
 * (U+0020). A `part` is one or more ASCII digits, directly followed by one of
 * the unit names `d`, `h`, `m`, `s`, and `ms`. The text holds at least one
 * part. The units come in that order, and each unit occurs at most one time.
 * A space before the first part, after the last part, or inside a part is not
 * accepted, and neither is a tab.
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
 * Format a number of milliseconds as text, such as `1h 30m`.
 *
 * For a value of one second or more, the text holds the units `d`, `h`, `m`,
 * and `s`, largest first, with one space between them. A unit with a count of
 * zero is left out. The part of the value under one second is dropped: the
 * function truncates and does not round. Thus `1500` gives `1s`, and `59999`
 * gives `59s`. Zero gives `0s`. A value from 1 to 999 gives the `ms` unit
 * only, such as `250ms`. The function refuses a number that is not a safe
 * integer of zero or more. It accepts `-0` and gives `0s`.
 *
 * @param ms - The duration in milliseconds. It must follow
 * `Number.isSafeInteger(ms) && ms >= 0`.
 * @returns The duration text.
 * @throws {RangeError} If `ms` is negative, is not an integer, is not finite,
 * or is more than `Number.MAX_SAFE_INTEGER`. The message names the value and
 * gives the reason.
 */
export function formatDuration(ms: number): string {
  if (!Number.isSafeInteger(ms)) {
    throw invalidDuration(String(ms), "the value is not a safe integer", RangeError);
  }
  if (ms < 0) {
    throw invalidDuration(String(ms), "the value is less than zero", RangeError);
  }
  if (ms === 0) {
    return `0${SMALLEST_FORMAT_UNIT.name}`;
  }
  if (ms < SMALLEST_FORMAT_UNIT.factor) {
    return `${ms}${SMALLEST_UNIT.name}`;
  }
  const parts: string[] = [];
  let rest = ms;
  for (const { name, factor } of FORMAT_UNITS) {
    const remainder = rest % factor;
    const count = (rest - remainder) / factor;
    if (count > 0) {
      parts.push(`${count}${name}`);
    }
    rest = remainder;
  }
  return parts.join(" ");
}
