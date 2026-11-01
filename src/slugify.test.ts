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
