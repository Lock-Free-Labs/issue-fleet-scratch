import assert from "node:assert/strict";
import { test } from "node:test";

import { formatBytes } from "./format-bytes.ts";

test("a size under one kilobyte has no decimal", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1023), "1023 B");
  assert.equal(formatBytes(512.4), "512 B");
});

test("a size of one kilobyte or more has one decimal and a unit", () => {
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(formatBytes(1536), "1.5 KB");
  assert.equal(formatBytes(1.5 * 1024 ** 2), "1.5 MB");
  assert.equal(formatBytes(1024 ** 3), "1.0 GB");
  assert.equal(formatBytes(2.5 * 1024 ** 4), "2.5 TB");
  assert.equal(formatBytes(1024 ** 8), "1.0 YB");
  assert.equal(formatBytes(1024 ** 9), "1024.0 YB");
});

test("a size that rounds up to 1024 of a unit moves to the next unit", () => {
  assert.equal(formatBytes(1023.4), "1023 B");
  assert.equal(formatBytes(1023.5), "1.0 KB");
  assert.equal(formatBytes(1048524), "1023.9 KB");
  assert.equal(formatBytes(1048525), "1.0 MB");
  assert.equal(formatBytes(1048575), "1.0 MB");
});
