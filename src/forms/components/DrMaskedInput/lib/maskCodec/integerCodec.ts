import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';

export function canonicalizeInteger(display: string): string {
  const raw = display.replaceAll(integerInputParams.thousandSeparator, '');

  if (raw === '' || raw === '-') {
    return '';
  }

  const digits = raw.replace(/^-/, '').replace(/^0+(?=\d)/, '');

  return raw.startsWith('-') && digits !== '0' ? `-${digits}` : digits;
}
