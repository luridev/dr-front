import { intlNumberFormat } from '@/formatting/lib/formatNumber/config';
import { isFiniteNumber } from '@/numbers/lib/isFiniteNumber/isFiniteNumber';

export function formatNumber(n?: number) {
  return isFiniteNumber(n) ? intlNumberFormat.format(n) : '—';
}
