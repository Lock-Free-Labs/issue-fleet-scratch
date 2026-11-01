import assert from "node:assert/strict";
import { test } from "node:test";

import { slugify } from "./slugify.ts";

test("slugify makes the text lowercase and replaces each run of other characters with one hyphen", () => {
  assert.equal(slugify("Hello World"), "hello-world");
  assert.equal(slugify("Top 10 Tips"), "top-10-tips");
  assert.equal(slugify("rock  &&  roll"), "rock-roll");
  assert.equal(slugify("snake_case_name"), "snake-case-name");
  assert.equal(slugify("ABC123"), "abc123");
});
