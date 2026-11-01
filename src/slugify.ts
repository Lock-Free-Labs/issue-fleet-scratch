/** The options of {@link slugify}. */
export interface SlugifyOptions {
  /** The maximum length of the slug, in characters. */
  maxLength?: number;
}

/**
 * Make a URL slug from a title.
 *
 * @param text - The title.
 * @param options - The options. See {@link SlugifyOptions}.
 * @returns The slug.
 */
export function slugify(text: string, options?: SlugifyOptions): string {
  void options;
  return text;
}
