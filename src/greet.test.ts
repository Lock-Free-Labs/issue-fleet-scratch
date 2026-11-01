import assert from "node:assert/strict";
import { test } from "node:test";

import { greet, greetAll } from "./greet.ts";

test("greet names the person", () => {
  assert.equal(greet("Tim"), "Hello, Tim!");
});

test("greetAll with one name gives the same text as greet", () => {
  assert.equal(greetAll(["Ann"]), greet("Ann"));
});

test("greetAll with two names joins them with and, in the order of the list", () => {
  assert.equal(greetAll(["Ann", "Bob"]), "Hello, Ann and Bob!");
  assert.equal(greetAll(["Bob", "Ann"]), "Hello, Bob and Ann!");
});
