import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';
import { normalizeNegativeZero } from '@/numbers/lib/normalizeNegativeZero/normalizeNegativeZero';
import type { IntegerInputParseResult } from '@/forms/lib/inputFormats/integer/types';

export function formatIntegerInputString(
  value: string,
  thousandSeparator = integerInputParams.thousandSeparator,
): string {
  const sign = value.startsWith(integerInputParams.minusSign) ? integerInputParams.minusSign : '';
  const digits = value.replaceAll(/\D/g, '');

  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
}

export function parseIntegerInputValue(
  value: string,
  thousandSeparator = integerInputParams.thousandSeparator,
): IntegerInputParseResult {
  if (value === '') {
    return { status: 'empty' };
  }

  if (value === integerInputParams.minusSign) {
    return { status: 'incomplete' };
  }

  const normalizedValue = value.replaceAll(thousandSeparator, '');

  if (!/^-?\d+$/.test(normalizedValue)) {
    return { status: 'invalid' };
  }

  const numberValue = Number(normalizedValue);

  return Number.isSafeInteger(numberValue)
    ? { status: 'valid', value: normalizeNegativeZero(numberValue) }
    : { status: 'out-of-range' };
}

export function stringifyIntegerInputValue(
  value: number | null,
  thousandSeparator = integerInputParams.thousandSeparator,
): string {
  if (value == null) {
    return '';
  }

  return Number.isInteger(value)
    ? formatIntegerInputString(BigInt(value).toString(), thousandSeparator)
    : String(value);
}
