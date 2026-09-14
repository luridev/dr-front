import { isFiniteNumber } from '@/numbers/lib/isFiniteNumber/isFiniteNumber';

export function truncate(value: unknown, fallback = Number.NaN): number {
  return isFiniteNumber(value) ? Math.trunc(value) : fallback;
}
