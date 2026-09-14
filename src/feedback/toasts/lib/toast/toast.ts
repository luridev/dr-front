import {
  defaultToastTitles,
  maxToastDuration,
  minToastDuration,
  baseToastDuration,
  toastDurationPerCharacter,
} from '@/feedback/toasts/config';
import { enqueueToast } from '@/feedback/toasts/lib/toastState/toastState';
import { isSafeIntegerInRange } from '@/numbers/lib/isSafeIntegerInRange/isSafeIntegerInRange';
import { isEmptyString } from '@/strings/lib/isEmptyString/isEmptyString';
import { normalizeToString } from '@/strings/lib/normalizeToString/normalizeToString';
import type { DrToastItem, DrToastOptions, DrToastVariant, DrToastVariantOptions } from '@/feedback/toasts/types';

let uid = 0;

function getToastDuration(text: string): number {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const characterCount = Array.from(normalizedText).length;

  return Math.min(
    maxToastDuration,
    Math.max(minToastDuration, baseToastDuration + characterCount * toastDurationPerCharacter),
  );
}

function isValidToastDuration(value: unknown): value is number {
  return isSafeIntegerInRange(value, 1, maxToastDuration);
}

function show(options: DrToastOptions): number {
  const variant = options.variant ?? 'info';
  const normalizedTitle = normalizeToString(options.title);
  const title = isEmptyString(normalizedTitle) ? defaultToastTitles[variant] : normalizedTitle;
  const message = options.message.trim();

  const requestedDuration = options.duration;

  const duration = isValidToastDuration(requestedDuration)
    ? requestedDuration
    : getToastDuration(`${title} ${message}`);

  uid += 1;

  const toastItem: DrToastItem = {
    uid,
    key: `${variant}\0${title}\0${message}`,
    variant,
    title,
    message,
    duration,
  };

  return enqueueToast(toastItem);
}

function showVariant(variant: DrToastVariant, options: DrToastVariantOptions): number {
  return show({
    ...options,
    variant,
  });
}

export const toast = {
  show,

  info(options: DrToastVariantOptions) {
    return showVariant('info', options);
  },

  success(options: DrToastVariantOptions) {
    return showVariant('success', options);
  },

  warning(options: DrToastVariantOptions) {
    return showVariant('warning', options);
  },

  error(options: DrToastVariantOptions) {
    return showVariant('error', options);
  },
};
