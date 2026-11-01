import assert from "node:assert/strict";
import { test } from "node:test";

import { slugify } from "./slugify.ts";

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

test("slugify changes each letter of Latin-1 Supplement and Latin Extended-A to a-z, also inside a word", () => {
  const failures: string[] = [];
  for (let codePoint = 0x00c0; codePoint <= 0x017f; codePoint += 1) {
    const letter = String.fromCodePoint(codePoint);
    if (!/\p{L}/u.test(letter)) {
      continue;
    }
    // A letter alone hides a separator: step 6 removes it at the edges.
    const slug = slugify(`a${letter}a`);
    if (!/^a[a-z]+a$/.test(slug)) {
      failures.push(`U+${codePoint.toString(16).toUpperCase()} ${letter} -> ${slug}`);
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
