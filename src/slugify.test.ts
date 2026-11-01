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
