import type { DrMessageKey } from '@/configuration/types';
import type { DrToastVariant } from '@/feedback/toasts/types';

export const minToastDuration = 6_000;
export const maxToastDuration = 30_000;
export const baseToastDuration = 4_000;
export const toastDurationPerCharacter = 50;

export const toastTitleKeys = {
  info: 'toast.info',
  success: 'toast.success',
  warning: 'toast.warning',
  error: 'toast.error',
} as const satisfies Record<DrToastVariant, DrMessageKey>;
