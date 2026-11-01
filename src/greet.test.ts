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

test("greetAll with three or more names uses an Oxford comma, in the order of the list", () => {
  assert.equal(greetAll(["Ann", "Bob", "Cy"]), "Hello, Ann, Bob, and Cy!");
  assert.equal(greetAll(["Cy", "Ann", "Bob"]), "Hello, Cy, Ann, and Bob!");
  assert.equal(greetAll(["Ann", "Bob", "Cy", "Dee"]), "Hello, Ann, Bob, Cy, and Dee!");
});
