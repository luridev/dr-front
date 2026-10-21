import {
  toastTitleKeys,
  maxToastDuration,
  minToastDuration,
  baseToastDuration,
  toastDurationPerCharacter,
} from '@/feedback/toasts/config';
import type { DrTranslate } from '@/configuration/types';
import type { DrToastItem } from '@/feedback/toasts/types';

export function getToastTitle(toast: DrToastItem, t: DrTranslate): string {
  return toast.title ?? t(toastTitleKeys[toast.variant]);
}

export function getToastDuration(toast: DrToastItem, t: DrTranslate): number {
  if (toast.duration !== undefined) {
    return toast.duration;
  }

  const text = `${getToastTitle(toast, t)} ${toast.message}`.replace(/\s+/g, ' ').trim();

  return Math.min(
    maxToastDuration,
    Math.max(minToastDuration, baseToastDuration + Array.from(text).length * toastDurationPerCharacter),
  );
}
