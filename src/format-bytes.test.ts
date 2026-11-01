import assert from "node:assert/strict";
import { test } from "node:test";
import { formatBytes } from "./format-bytes.ts";

test("a size under one kilobyte has no decimal", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1023), "1023 B");
  assert.equal(formatBytes(512.4), "512 B");
});
