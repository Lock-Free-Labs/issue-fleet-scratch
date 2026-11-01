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
 * A combining mark, for example the grave accent of "è" after NFKD
 * normalization divides "è" into "e" and the mark.
 */
const COMBINING_MARK = /\p{M}/gu;

/**
 * Make a function that replaces each character of a text that is a key of
 * `replacements` with the value of that key. The other characters stay.
 *
 * @param replacements - A map from one character to the text that replaces it.
 * @returns The function.
 */
function characterReplacer(
  replacements: ReadonlyMap<string, string>,
): (text: string) => string {
  const pattern = new RegExp(`[${[...replacements.keys()].join("")}]`, "gu");
  return (text) =>
    text.replace(
      pattern,
      (character) => replacements.get(character) ?? character,
    );
}

/**
 * The characters whose compatibility form (NFKD) does not suit a slug, and
 * the text that slugify writes in their place before NFKD.
 *
 * - NFKD changes "ŀ" to "l·", "ŉ" to "ʼn" and "ẚ" to "aʾ", and the "·", the
 *   "ʼ" and the "ʾ" would split the word. These letters become their base
 *   letter.
 * - NFKD changes a trademark sign to letters, for example "™" to "TM", and
 *   they would join the word before the sign. A trademark sign becomes a
 *   separator, the same as "®" and "©", which have no compatibility form.
 */
const COMPATIBILITY_OVERRIDES: ReadonlyMap<string, string> = new Map([
  ["Ŀ", "L"],
  ["ŀ", "l"],
  ["ŉ", "n"],
  ["\u{1E9A}", "a"],
  ["™", SEPARATOR],
  ["℠", SEPARATOR],
  ["\u{1F16A}", SEPARATOR],
  ["\u{1F16B}", SEPARATOR],
  ["\u{1F16C}", SEPARATOR],
]);

/**
 * The ASCII letters of each lowercase Latin letter that has no
 * decomposition to `a`-`z`, for example "ø", "ß" and "ə". With
 * {@link COMPATIBILITY_OVERRIDES} and NFKD, this map brings each Latin
 * letter of Latin-1 Supplement, Latin Extended-A, Latin Extended-B and
 * Latin Extended Additional to `a`-`z`, also inside a word.
 *
 * The tone letters, the clicks and the glottal stops of Latin Extended-B
 * are not drawn from a letter and have no base letter. They are not in
 * this map, thus they become a separator, the same as a punctuation mark.
 */
const LETTER_FOLDS: ReadonlyMap<string, string> = new Map([
  ["æ", "ae"],
  ["ð", "d"],
  ["ø", "o"],
  ["þ", "th"],
  ["ß", "ss"],
  ["đ", "d"],
  ["ħ", "h"],
  ["ı", "i"],
  ["ĸ", "q"],
  ["ł", "l"],
  ["ŋ", "n"],
  ["œ", "oe"],
  ["ŧ", "t"],
  ["ƀ", "b"],
  ["ƃ", "b"],
  ["ƈ", "c"],
  ["ƌ", "d"],
  ["ƍ", "d"],
  ["ƒ", "f"],
  ["ƕ", "hv"],
  ["ƙ", "k"],
  ["ƚ", "l"],
  ["ƛ", "l"],
  ["ƞ", "n"],
  ["ƣ", "gh"],
  ["ƥ", "p"],
  ["ƪ", "sh"],
  ["ƫ", "t"],
  ["ƭ", "t"],
  ["ƴ", "y"],
  ["ƶ", "z"],
  ["ƹ", "zh"],
  ["ƺ", "zh"],
  ["ƿ", "w"],
  ["ǝ", "e"],
  ["ǥ", "g"],
  ["ȝ", "gh"],
  ["ȡ", "d"],
  ["ȣ", "ou"],
  ["ȥ", "z"],
  ["ȴ", "l"],
  ["ȵ", "n"],
  ["ȶ", "t"],
  ["ȷ", "j"],
  ["ȸ", "db"],
  ["ȹ", "qp"],
  ["ȼ", "c"],
  ["ȿ", "s"],
  ["ɀ", "z"],
  ["ɇ", "e"],
  ["ɉ", "j"],
  ["ɋ", "q"],
  ["ɍ", "r"],
  ["ɏ", "y"],
  ["ɓ", "b"],
  ["ɔ", "o"],
  ["ɖ", "d"],
  ["ɗ", "d"],
  ["ə", "e"],
  ["ɛ", "e"],
  ["ɠ", "g"],
  ["ɣ", "g"],
  ["ɨ", "i"],
  ["ɩ", "i"],
  ["ɯ", "m"],
  ["ɲ", "n"],
  ["ɵ", "o"],
  ["ʀ", "r"],
  ["ʃ", "sh"],
  ["ʈ", "t"],
  ["ʉ", "u"],
  ["ʊ", "u"],
  ["ʋ", "v"],
  ["ʌ", "v"],
  ["ʒ", "zh"],
  ["ẜ", "s"],
  ["ẝ", "s"],
  ["ẟ", "d"],
  ["ỻ", "ll"],
  ["ỽ", "v"],
  ["ỿ", "y"],
  ["ⱥ", "a"],
  ["ⱦ", "t"],
]);

/** Replace each character of {@link COMPATIBILITY_OVERRIDES}. */
const replaceCompatibilityOverrides = characterReplacer(
  COMPATIBILITY_OVERRIDES,
);

/** Replace each letter of {@link LETTER_FOLDS}. */
const foldLetters = characterReplacer(LETTER_FOLDS);

/** A run of one or more characters that a slug cannot contain. */
const DISALLOWED_RUN = /[^a-z0-9]+/g;

/** A separator at the start or at the end of a slug. */
const EDGE_SEPARATOR = new RegExp(`^${SEPARATOR}|${SEPARATOR}$`, "g");

/**
 * Make a URL slug from a title.
 *
 * The steps are:
 *
 * 1. Replace each character of {@link COMPATIBILITY_OVERRIDES}: "ŀ"
 *    becomes "l", and "™" becomes a hyphen.
 * 2. Change each character to its compatibility form (NFKD), and remove
 *    the diacritics: "Crème" becomes "Creme", "ﬁ" becomes "fi", and
 *    "１" becomes "1".
 * 3. Make the text lowercase.
 * 4. Change each letter of {@link LETTER_FOLDS} to its ASCII letters: "ø"
 *    becomes "o", "ß" becomes "ss", and "ə" becomes "e".
 * 5. Replace each run of characters that are not `a`-`z` or `0`-`9` with
 *    one hyphen.
 * 6. Remove a hyphen at the start and at the end.
 * 7. If `options.maxLength` is set, cut the slug to that length (see
 *    {@link SlugifyOptions.maxLength}).
 *
 * @example
 * slugify("Hello, World!"); // "hello-world"
 * slugify("Crème Brûlée"); // "creme-brulee"
 * slugify("Łódź Straße"); // "lodz-strasse"
 * slugify("one two three", { maxLength: 9 }); // "one-two"
 *
 * @param text - The title.
 * @param options - The options. See {@link SlugifyOptions}.
 * @returns The slug. It is empty when the text has no letter or digit.
 * @throws {RangeError} If `options.maxLength` is negative or `NaN`.
 */
export function slugify(text: string, options?: SlugifyOptions): string {
  const folded = foldLetters(
    replaceCompatibilityOverrides(text)
      .normalize("NFKD")
      .replace(COMBINING_MARK, "")
      .toLowerCase(),
  );
  const slug = folded
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
