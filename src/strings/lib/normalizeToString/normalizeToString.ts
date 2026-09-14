import { isFiniteNumber } from '@/numbers/lib/isFiniteNumber/isFiniteNumber';

export function normalizeToString(value?: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (isFiniteNumber(value)) {
    return `${value}`;
  }

  return '';
}
