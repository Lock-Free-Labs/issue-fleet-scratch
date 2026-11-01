/** The options of {@link slugify}. */
export interface SlugifyOptions {
  /**
   * The maximum length of the slug, in characters. A longer slug is cut
   * at a hyphen, thus it keeps only full words and does not end with a
   * hyphen. If the first word is longer than `maxLength`, the cut is at
   * `maxLength`. If this option is not set, the length has no limit.
   * It must be 0 or more. `Infinity` is permitted and sets no limit.
   */
  maxLength?: number;
}

/** The character that divides the words of a slug. */
const SEPARATOR = "-";

/**
 * A combining mark, for example the grave accent of "è" after NFD
 * normalization divides "è" into "e" and the mark.
 */
const COMBINING_MARK = /\p{M}/gu;

/** A run of one or more characters that a slug cannot contain. */
const DISALLOWED_RUN = /[^a-z0-9]+/g;

/** A separator at the start or at the end of a slug. */
const EDGE_SEPARATOR = new RegExp(`^${SEPARATOR}|${SEPARATOR}$`, "g");

/**
 * Make a URL slug from a title.
 *
 * The steps are:
 *
 * 1. Remove the diacritics: "Crème" becomes "Creme".
 * 2. Make the text lowercase.
 * 3. Replace each run of characters that are not `a`-`z` or `0`-`9` with
 *    one hyphen.
 * 4. Remove a hyphen at the start and at the end.
 * 5. If `options.maxLength` is set, cut the slug to that length (see
 *    {@link SlugifyOptions.maxLength}).
 *
 * @example
 * slugify("Hello, World!"); // "hello-world"
 * slugify("Crème Brûlée"); // "creme-brulee"
 * slugify("one two three", { maxLength: 9 }); // "one-two"
 *
 * @param text - The title.
 * @param options - The options. See {@link SlugifyOptions}.
 * @returns The slug. It is empty when the text has no letter or digit.
 * @throws {RangeError} If `options.maxLength` is negative or `NaN`.
 */
export function slugify(text: string, options?: SlugifyOptions): string {
  const slug = text
    .normalize("NFD")
    .replace(COMBINING_MARK, "")
    .toLowerCase()
    .replace(DISALLOWED_RUN, SEPARATOR)
    .replace(EDGE_SEPARATOR, "");
  const maxLength = options?.maxLength;
  return maxLength === undefined ? slug : truncate(slug, maxLength);
}

/**
 * Cut a slug so that it is not longer than `maxLength`.
 *
 * The cut is at the last separator at or before `maxLength`, thus the
 * result keeps only full words and does not end with a separator. If the
 * first word is longer than `maxLength`, the cut is at `maxLength`.
 *
 * @param slug - A slug with no separator at the start or at the end, and
 *   no two separators side by side.
 * @param maxLength - The maximum length of the result.
 * @returns The slug, or its start.
 * @throws {RangeError} If `maxLength` is negative or `NaN`.
 */
function truncate(slug: string, maxLength: number): string {
  if (Number.isNaN(maxLength) || maxLength < 0) {
    throw new RangeError(
      `maxLength must be 0 or more, but it is ${maxLength}.`,
    );
  }
  if (slug.length <= maxLength) {
    return slug;
  }
  const lastSeparator = slug.lastIndexOf(SEPARATOR, maxLength);
  return slug.slice(0, lastSeparator === -1 ? maxLength : lastSeparator);
}
