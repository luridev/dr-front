import type { DrToastVariant } from '@/feedback/toasts/types';

export const minToastDuration = 6_000;
export const maxToastDuration = 30_000;
export const baseToastDuration = 4_000;
export const toastDurationPerCharacter = 50;

export const defaultToastTitles = {
  info: 'Информация',
  success: 'Успешно',
  warning: 'Предупреждение',
  error: 'Ошибка',
} as const satisfies Record<DrToastVariant, string>;
