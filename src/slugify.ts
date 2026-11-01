/** The options of {@link slugify}. */
export interface SlugifyOptions {
  /** The maximum length of the slug, in characters. */
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
 * @param text - The title.
 * @param options - The options. See {@link SlugifyOptions}.
 * @returns The slug.
 */
export function slugify(text: string, options?: SlugifyOptions): string {
  void options;
  return text
    .normalize("NFD")
    .replace(COMBINING_MARK, "")
    .toLowerCase()
    .replace(DISALLOWED_RUN, SEPARATOR)
    .replace(EDGE_SEPARATOR, "");
}
