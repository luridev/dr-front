import type { DrInputDateStatus } from '@/index';

export const dateGalleryStatusLabels = {
  empty: 'Empty',
  incomplete: 'Incomplete date',
  invalid: 'Invalid date',
  'out-of-range': 'Out of range',
  valid: 'Valid date',
} as const satisfies Record<DrInputDateStatus, string>;
