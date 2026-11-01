/**
 * Give a size in whole bytes with the unit B.
 * A fractional byte count rounds to the nearest byte.
 *
 * @param bytes - The size in bytes.
 * @returns The size in whole bytes, for example "512 B".
 */
export function formatBytes(bytes: number): string {
  return `${Math.round(bytes)} B`;
}
