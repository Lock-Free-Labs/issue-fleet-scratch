import assert from "node:assert/strict";
import { test } from "node:test";

import { greet, greetAll } from "./greet.ts";

test("greet names the person", () => {
  assert.equal(greet("Tim"), "Hello, Tim!");
});

test("greetAll with one name gives the same text as greet", () => {
  assert.equal(greetAll(["Ann"]), greet("Ann"));
});
