export function normalizeMaxLength(maxLength: number | undefined): number | undefined {
  return maxLength != null && Number.isInteger(maxLength) && maxLength >= 0 ? maxLength : undefined;
}
