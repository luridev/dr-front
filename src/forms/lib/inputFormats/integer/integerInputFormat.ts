import { maskitoNumber, maskitoParseNumber, maskitoStringifyNumber } from '@maskito/kit';
import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';
import { normalizeNegativeZero } from '@/numbers/lib/normalizeNegativeZero/normalizeNegativeZero';
import type { MaskitoOptions } from '@maskito/core';

export const integerInputMaskOptions: MaskitoOptions = maskitoNumber(integerInputParams);

export function parseIntegerInputValue(value: string): number | null {
  const normalizedValue = value.replaceAll(integerInputParams.thousandSeparator ?? '', '');

  if (!/^-?\d+$/.test(normalizedValue)) {
    return null;
  }

  const numberValue = maskitoParseNumber(value, integerInputParams);

  return Number.isSafeInteger(numberValue) ? normalizeNegativeZero(numberValue) : null;
}

export function stringifyIntegerInputValue(value: number | null): string {
  if (value == null) {
    return '';
  }

  return Number.isInteger(value) ? maskitoStringifyNumber(value, integerInputParams) : String(value);
}
