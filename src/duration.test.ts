import assert from "node:assert/strict";
import { test } from "node:test";

import { parseDuration } from "./duration.ts";

test("parseDuration reads the units d, h, m, s, and ms in that order", () => {
  assert.equal(parseDuration("1h30m"), 5_400_000);
  assert.equal(parseDuration("250ms"), 250);
  assert.equal(parseDuration("1d2h3m4s5ms"), 93_784_005);
  assert.equal(parseDuration("2d"), 172_800_000);
  assert.equal(parseDuration("0s"), 0);
});
