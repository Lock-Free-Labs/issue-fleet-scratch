import assert from "node:assert/strict";
import { test } from "node:test";

import { slugify } from "./slugify.ts";

/** The Unicode blocks whose Latin letters slugify changes to `a`-`z`. */
const LATIN_BLOCKS: ReadonlyArray<
  readonly [name: string, first: number, last: number]
> = [
  ["Latin-1 Supplement", 0x0080, 0x00ff],
  ["Latin Extended-A", 0x0100, 0x017f],
  ["Latin Extended-B", 0x0180, 0x024f],
  ["Latin Extended Additional", 0x1e00, 0x1eff],
];

/**
 * The letters of {@link LATIN_BLOCKS} that are not drawn from a letter: the
 * tone letters, the clicks and the glottal stops. They have no base letter
 * in `a`-`z`, thus slugify replaces them with a hyphen, the same as a
 * punctuation mark.
 */
const LETTERS_WITH_NO_BASE_LETTER: ReadonlySet<number> = new Set([
  0x0184, 0x0185, 0x01a7, 0x01a8, 0x01bb, 0x01bc, 0x01bd, 0x01be, 0x01c0,
  0x01c1, 0x01c2, 0x01c3, 0x0241, 0x0242,
]);

test("slugify makes the text lowercase and replaces each run of other characters with one hyphen", () => {
  assert.equal(slugify("Hello, World!"), "hello-world");
  assert.equal(slugify("Hello World"), "hello-world");
  assert.equal(slugify("Top 10 Tips"), "top-10-tips");
  assert.equal(slugify("rock  &&  roll"), "rock-roll");
  assert.equal(slugify("snake_case_name"), "snake-case-name");
  assert.equal(slugify("ABC123"), "abc123");
});

test("slugify removes a hyphen at the start and at the end", () => {
  assert.equal(slugify("  --Hi--  "), "hi");
  assert.equal(slugify("(draft) notes"), "draft-notes");
  assert.equal(slugify("Why?"), "why");
  assert.equal(slugify("!!!"), "");
  assert.equal(slugify(""), "");
});

test("slugify removes diacritics before it replaces the other characters", () => {
  assert.equal(slugify("Crème Brûlée"), "creme-brulee");
  assert.equal(slugify("Ångström"), "angstrom");
  assert.equal(slugify("Ñandú São Paulo"), "nandu-sao-paulo");
  // The same text in decomposed form: a base letter and a combining mark.
  assert.equal(slugify("Crème"), "creme");
});

test("slugify changes a Latin letter that has no decomposition to its base letters", () => {
  assert.equal(slugify("Øresund"), "oresund");
  assert.equal(slugify("Łódź Straße"), "lodz-strasse");
  assert.equal(slugify("Ærø"), "aero");
  assert.equal(slugify("Đorđe"), "dorde");
  assert.equal(slugify("Œuvre"), "oeuvre");
  assert.equal(slugify("Þór"), "thor");
  assert.equal(slugify("Kırıkkale"), "kirikkale");
  assert.equal(slugify("Ħamrun"), "hamrun");
  // The capital sharp s becomes "ß" in lowercase.
  assert.equal(slugify("STRAẞE"), "strasse");
});

test("slugify changes a letter of Latin Extended-B and its lowercase letter to its base letter", () => {
  assert.equal(slugify("Azərbaycan"), "azerbaycan");
  assert.equal(slugify("ƏLİYEV"), "eliyev");
  assert.equal(slugify("Ƒunction"), "function");
  assert.equal(slugify("Eʋegbe"), "evegbe");
  assert.equal(slugify("Ɔkɔm"), "okom");
  assert.equal(slugify("Ɓaƙi Ɗan"), "baki-dan");
});

test("slugify changes each Latin letter of the Latin blocks to a-z, also inside a word", () => {
  const failures: string[] = [];
  for (const [block, first, last] of LATIN_BLOCKS) {
    for (let codePoint = first; codePoint <= last; codePoint += 1) {
      const letter = String.fromCodePoint(codePoint);
      if (!/\p{Script=Latin}/u.test(letter)) {
        continue;
      }
      // A letter alone hides a separator: step 6 removes it at the edges.
      const slug = slugify(`a${letter}a`);
      const expected = LETTERS_WITH_NO_BASE_LETTER.has(codePoint)
        ? /^a-a$/
        : /^a[a-z]+a$/;
      if (!expected.test(slug)) {
        const name = `U+${codePoint.toString(16).toUpperCase()} ${letter}`;
        failures.push(`${block}: ${name} -> ${slug}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test("slugify keeps a letter whose compatibility form holds a punctuation mark inside its word", () => {
  // NFKD changes "ŀ" to "l·" and "ŉ" to "ʼn".
  assert.equal(slugify("Coŀlecció"), "colleccio");
  assert.equal(slugify("COĿLECCIÓ"), "colleccio");
  assert.equal(slugify("Wat is ŉ boek"), "wat-is-n-boek");
});

test("slugify changes a compatibility form to its usual letters and digits", () => {
  assert.equal(slugify("ﬁle １２３"), "file-123");
  assert.equal(slugify("ﬂour"), "flour");
  assert.equal(slugify("Ｈｅｌｌｏ"), "hello");
});

test("slugify replaces a trademark sign with a hyphen, the same as ® and ©", () => {
  assert.equal(slugify("Acme™ Widget"), "acme-widget");
  assert.equal(slugify("Acme™Widget"), "acme-widget");
  assert.equal(slugify("Acme℠ Widget"), "acme-widget");
  // The raised MC, MD and MR signs are the trademark signs of French.
  assert.equal(slugify("Acme\u{1F16A} Widget"), "acme-widget");
  assert.equal(slugify("Acme\u{1F16B} Widget"), "acme-widget");
  assert.equal(slugify("Acme\u{1F16C} Widget"), "acme-widget");
  assert.equal(slugify("Acme® Widget"), "acme-widget");
  assert.equal(slugify("Acme©Widget"), "acme-widget");
  // NFKD still changes a unit sign to its letters.
  assert.equal(slugify("5 ㎏ bag"), "5-kg-bag");
});

test("slugify with maxLength cuts the slug at a hyphen and never ends with a hyphen", () => {
  assert.equal(slugify("one two three", { maxLength: 9 }), "one-two");
  // The cut falls exactly before a hyphen.
  assert.equal(slugify("one two three", { maxLength: 7 }), "one-two");
  // The cut falls exactly after a hyphen.
  assert.equal(slugify("one two three", { maxLength: 8 }), "one-two");
  // The slug is not longer than maxLength, thus slugify does not cut it.
  assert.equal(slugify("one two three", { maxLength: 13 }), "one-two-three");
  assert.equal(slugify("one two three", { maxLength: 50 }), "one-two-three");
  // A first word that is longer than maxLength is cut at maxLength.
  assert.equal(slugify("one two three", { maxLength: 2 }), "on");
  assert.equal(slugify("Supercalifragilistic word", { maxLength: 5 }), "super");
  assert.equal(slugify("one two three", { maxLength: 0 }), "");
});

test("slugify throws a RangeError when maxLength is negative or NaN", () => {
  for (const maxLength of [-1, -0.5, Number.NaN, Number.NEGATIVE_INFINITY]) {
    assert.throws(
      () => slugify("one two three", { maxLength }),
      RangeError,
      `maxLength ${maxLength}`,
    );
  }
  // Infinity is a valid limit: the slug is never cut.
  assert.equal(
    slugify("one two three", { maxLength: Number.POSITIVE_INFINITY }),
    "one-two-three",
  );
});
