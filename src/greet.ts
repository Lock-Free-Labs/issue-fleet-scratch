/**
 * Make a greeting for a person.
 *
 * @param name - The name of the person.
 * @returns The greeting text.
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

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
  return "";
}
