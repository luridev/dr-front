import { formatNumber } from '@/formatting/lib/formatNumber/formatNumber';

const kibibyte = 1024;
const mebibyte = kibibyte * 1024;
const gibibyte = mebibyte * 1024;

export function formatFileSize(byteCount: number): string {
  if (byteCount < kibibyte) {
    const n = Math.abs(byteCount);
    const n10 = n % 10;
    const n100 = n % 100;
    const unit = n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? 'байта' : 'байт';

    return `${formatNumber(byteCount)} ${unit}`;
  }

  if (byteCount < mebibyte) {
    return `${formatNumber(byteCount / kibibyte)} КиБ`;
  }

  if (byteCount < gibibyte) {
    return `${formatNumber(byteCount / mebibyte)} МиБ`;
  }

  return `${formatNumber(byteCount / gibibyte)} ГиБ`;
}
