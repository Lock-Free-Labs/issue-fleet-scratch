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

test("parseDuration accepts spaces between the parts", () => {
  assert.equal(parseDuration("1h 30m"), 5_400_000);
  assert.equal(parseDuration("1d 2h 3m 4s 5ms"), 93_784_005);
  assert.equal(parseDuration("1h   30m"), 5_400_000);
});

test("parseDuration refuses bad text with a SyntaxError that names the text", () => {
  const cases: Record<string, readonly string[]> = {
    "empty text": [""],
    "unknown unit": ["1x", "1w", "5H", "1hr", "1hm"],
    "number without a unit": ["5", "1h30"],
    "unit without a number": ["h", "ms"],
    "unit two times": ["1h1h", "1h 1h", "1s2s"],
    "units out of order": ["30m1h", "1ms1s", "1s1m", "1h1d"],
    "spaces that are not accepted": [" ", " 1h", "1h ", "1 h", "1h\t30m"],
    "other characters": ["1.5h", "-1h", "+1h", "1h,30m"],
  };
  for (const [name, texts] of Object.entries(cases)) {
    for (const text of texts) {
      assert.throws(
        () => parseDuration(text),
        (error) => error instanceof SyntaxError && error.message.includes(JSON.stringify(text)),
        `${name}: ${JSON.stringify(text)}`,
      );
    }
  }
});
