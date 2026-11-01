// One kilobyte holds 1024 bytes. Each larger unit is 1024 times the one before.
const BASE = 1024;

// The units in order, from the smallest to the largest.
const UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const;

/**
 * Round a value the way the output shows it for a unit.
 * Bytes (index 0) show whole numbers. Every other unit shows one decimal.
 * This uses `toFixed`, so the unit choice matches the text exactly.
 *
 * @param value - The value in the unit at `index`.
 * @param index - The position of the unit in `UNITS`.
 * @returns The value as the output shows it.
 */
function roundForUnit(value: number, index: number): number {
  return index === 0 ? Math.round(value) : Number(value.toFixed(1));
}

/**
 * Give a size a person can read.
 * Under 1 KB, the size is in whole bytes. A fractional byte count rounds
 * to the nearest byte.
 * From 1 KB up, the size has one decimal and the largest unit that keeps
 * the value at 1 or more. One unit is 1024 times the unit before it.
 * A size that rounds up to 1024 of a unit moves to the next unit, for
 * example 1048575 B gives "1.0 MB".
 * YB is the largest unit, so a size of 1024 YB or more stays in YB.
 *
 * @param bytes - The size in bytes.
 * @returns The size with its unit, for example "512 B" or "1.5 MB".
 */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let index = 0;
  while (roundForUnit(value, index) >= BASE && index < UNITS.length - 1) {
    value /= BASE;
    index += 1;
  }
  if (index === 0) {
    return `${Math.round(value)} ${UNITS[0]}`;
  }
  return `${value.toFixed(1)} ${UNITS[index]}`;
}
