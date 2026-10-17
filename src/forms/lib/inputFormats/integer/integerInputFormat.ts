import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';
import { normalizeNegativeZero } from '@/numbers/lib/normalizeNegativeZero/normalizeNegativeZero';

export function formatIntegerInputString(value: string): string {
  const sign = value.startsWith(integerInputParams.minusSign) ? integerInputParams.minusSign : '';
  const digits = value.replaceAll(/\D/g, '');

  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, integerInputParams.thousandSeparator);
}

export function parseIntegerInputValue(value: string): number | null {
  const normalizedValue = value.replaceAll(integerInputParams.thousandSeparator, '');

  if (!/^-?\d+$/.test(normalizedValue)) {
    return null;
  }

  const numberValue = Number(normalizedValue);

  return Number.isSafeInteger(numberValue) ? normalizeNegativeZero(numberValue) : null;
}

export function stringifyIntegerInputValue(value: number | null): string {
  if (value == null) {
    return '';
  }

  return Number.isInteger(value) ? formatIntegerInputString(BigInt(value).toString()) : String(value);
}
