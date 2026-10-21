import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type { DrTranslate } from '@/configuration/types';

export function resolveClearButtonAriaLabel(t: DrTranslate, label?: string, customAriaLabel?: string): string {
  if (customAriaLabel != null) {
    return customAriaLabel;
  }

  return isNonBlankString(label) ? t('input.clearNamed', { label: label.trim() }) : t('input.clear');
}
