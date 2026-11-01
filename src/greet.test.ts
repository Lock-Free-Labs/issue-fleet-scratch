import assert from "node:assert/strict";
import { test } from "node:test";

import { greet } from "./greet.ts";

test("greet names the person", () => {
  assert.equal(greet("Tim"), "Hello, Tim!");
});
