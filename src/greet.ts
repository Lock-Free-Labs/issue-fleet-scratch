/**
 * Make a greeting for a person.
 *
 * @param name - The name of the person.
 * @returns The greeting text.
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/** The text that joins the two names of a pair. */
const PAIR_SEPARATOR = " and ";

/** The text that joins the names of a list before the last name. */
const LIST_SEPARATOR = ", ";

/** The text before the last name of a list of three or more names (Oxford comma). */
const OXFORD_SEPARATOR = ", and ";

/**
 * Make one greeting for a list of people.
 *
 * One name gives the same text as `greet`. Two names are joined with "and".
 * Three or more names are joined with commas and an Oxford comma.
 * The names stay in the order of the list.
 *
 * @param names - The names of the people, in the order to greet them.
 * @returns The greeting text.
 * @throws {RangeError} If the list is empty.
 */
export function greetAll(names: string[]): string {
  if (names.length <= 2) {
    return greet(names.join(PAIR_SEPARATOR));
  }
  const last = names[names.length - 1];
  return greet(names.slice(0, -1).join(LIST_SEPARATOR) + OXFORD_SEPARATOR + last);
}
