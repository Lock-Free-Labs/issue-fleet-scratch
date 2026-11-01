// One kilobyte holds 1024 bytes. Each larger unit is 1024 times the one before.
const BASE = 1024;

// The units in order, from the smallest to the largest.
const UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const;

/**
 * Give a size a person can read.
 * Under 1 KB, the size is in whole bytes. A fractional byte count rounds
 * to the nearest byte.
 * From 1 KB up, the size has one decimal and the largest unit that keeps
 * the value at 1 or more. One unit is 1024 times the unit before it.
 * YB is the largest unit, so a size above 1024 YB stays in YB.
 *
 * @param bytes - The size in bytes.
 * @returns The size with its unit, for example "512 B" or "1.5 MB".
 */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let index = 0;
  while (value >= BASE && index < UNITS.length - 1) {
    value /= BASE;
    index += 1;
  }
  if (index === 0) {
    return `${Math.round(value)} ${UNITS[0]}`;
  }
  return `${value.toFixed(1)} ${UNITS[index]}`;
}
