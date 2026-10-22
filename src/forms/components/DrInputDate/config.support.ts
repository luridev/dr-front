import type { InputLocaleDatePart } from '@/forms/lib/getInputLocaleProfile/types';
import type { DrInputDateStatus } from '@/index';

export const dateGalleryPartLabels = {
  day: 'DD',
  month: 'MM',
  year: 'YYYY',
} as const satisfies Record<InputLocaleDatePart, string>;

export const dateGalleryStatusLabels = {
  empty: 'Empty',
  incomplete: 'Incomplete date',
  invalid: 'Invalid date',
  'out-of-range': 'Out of range',
  valid: 'Valid date',
} as const satisfies Record<DrInputDateStatus, string>;
