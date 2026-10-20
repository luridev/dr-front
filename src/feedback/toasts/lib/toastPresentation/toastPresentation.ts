import {
  defaultToastTitles,
  maxToastDuration,
  minToastDuration,
  baseToastDuration,
  toastDurationPerCharacter,
} from '@/feedback/toasts/config';
import type { DrToastItem } from '@/feedback/toasts/types';

export function getToastTitle(toast: DrToastItem): string {
  return toast.title ?? defaultToastTitles[toast.variant];
}

export function getToastDuration(toast: DrToastItem): number {
  if (toast.duration !== undefined) {
    return toast.duration;
  }

  const text = `${getToastTitle(toast)} ${toast.message}`.replace(/\s+/g, ' ').trim();

  return Math.min(
    maxToastDuration,
    Math.max(minToastDuration, baseToastDuration + Array.from(text).length * toastDurationPerCharacter),
  );
}
