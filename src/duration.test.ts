import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDuration, parseDuration } from "./duration.ts";

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

test("parseDuration refuses a value larger than Number.MAX_SAFE_INTEGER with a RangeError", () => {
  assert.equal(parseDuration("9007199254740991ms"), 9_007_199_254_740_991);
  assert.equal(parseDuration("104249991d"), 9_007_199_222_400_000);
  const cases: Record<string, string> = {
    "one more than the largest safe value": "9007199254740992ms",
    "days that give an unsafe product": "104249992d",
    "safe parts with an unsafe sum": "104249991d 23h",
    "digits that Number reads as Infinity": `1${"0".repeat(400)}d`,
  };
  for (const [name, text] of Object.entries(cases)) {
    assert.throws(
      () => parseDuration(text),
      (error) => error instanceof RangeError && error.message.includes(JSON.stringify(text)),
      `${name}: ${JSON.stringify(text.slice(0, 30))}`,
    );
  }
});

test("formatDuration gives the units d to s with a space between them and leaves out zero units", () => {
  assert.equal(formatDuration(5_400_000), "1h 30m");
  assert.equal(formatDuration(93_784_000), "1d 2h 3m 4s");
  assert.equal(formatDuration(86_400_000), "1d");
  assert.equal(formatDuration(90_000_000), "1d 1h");
  assert.equal(formatDuration(3_601_000), "1h 1s");
  assert.equal(formatDuration(1_000), "1s");
});

test("formatDuration gives 0s for zero and ms only for a value under one second", () => {
  assert.equal(formatDuration(0), "0s");
  assert.equal(formatDuration(250), "250ms");
  assert.equal(formatDuration(1), "1ms");
  assert.equal(formatDuration(999), "999ms");
  assert.equal(formatDuration(1_500), "1s");
  assert.equal(formatDuration(59_999), "59s");
  assert.equal(formatDuration(3_600_999), "1h");
});

test("formatDuration refuses a negative number or a number that is not a finite safe integer with a RangeError", () => {
  const cases: Record<string, number> = {
    "a negative integer": -1,
    "a negative multiple of one second": -1_000,
    "negative infinity": -Infinity,
    "positive infinity": Infinity,
    "not a number": NaN,
    "a fraction above one": 1.5,
    "a fraction under one": 0.1,
    "a negative fraction": -0.5,
    "the first integer that is not safe": 2 ** 53,
    "a huge number": 1e300,
  };
  for (const [name, value] of Object.entries(cases)) {
    assert.throws(
      () => formatDuration(value),
      (error) => error instanceof RangeError && error.message.includes(String(value)),
      `${name}: ${String(value)}`,
    );
  }
  assert.equal(formatDuration(Number.MAX_SAFE_INTEGER), "104249991d 8h 59m");
  assert.equal(formatDuration(-0), "0s");
});

test("parseDuration(formatDuration(ms)) gives ms again for each whole second from 0 to 100000", () => {
  const LAST_SECOND = 100_000;
  const MS_PER_SECOND = 1_000;
  let failure: string | undefined;
  for (let second = 0; second <= LAST_SECOND; second += 1) {
    const ms = second * MS_PER_SECOND;
    const text = formatDuration(ms);
    let result: number | string;
    try {
      result = parseDuration(text);
    } catch (error) {
      result = `threw ${String(error)}`;
    }
    if (result !== ms) {
      failure = `ms ${ms}: formatDuration gave ${JSON.stringify(text)}, parseDuration gave ${String(result)}`;
      break;
    }
  }
  assert.equal(failure, undefined, failure);
});
