export function normalizeNegativeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}
