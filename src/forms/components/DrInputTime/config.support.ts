import type { DrInputTimeStatus } from '@/index';

export const timeGalleryStatusLabels = {
  empty: 'Empty',
  incomplete: 'Incomplete time',
  invalid: 'Invalid time',
  valid: 'Valid time',
} as const satisfies Record<DrInputTimeStatus, string>;
