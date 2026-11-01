/** The options of {@link slugify}. */
export interface SlugifyOptions {
  /** The maximum length of the slug, in characters. */
  maxLength?: number;
}

/** The character that divides the words of a slug. */
const SEPARATOR = "-";

/** A run of one or more characters that a slug cannot contain. */
const DISALLOWED_RUN = /[^a-z0-9]+/g;

/**
 * Make a URL slug from a title.
 *
 * @param text - The title.
 * @param options - The options. See {@link SlugifyOptions}.
 * @returns The slug.
 */
export function slugify(text: string, options?: SlugifyOptions): string {
  void options;
  return text.toLowerCase().replace(DISALLOWED_RUN, SEPARATOR);
}
