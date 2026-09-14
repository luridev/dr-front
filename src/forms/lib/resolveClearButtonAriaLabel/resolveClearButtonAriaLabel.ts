import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';

export function resolveClearButtonAriaLabel(label?: string, customAriaLabel?: string): string {
  if (customAriaLabel != null) {
    return customAriaLabel;
  }

  return isNonBlankString(label) ? `Очистить поле «${label.trim()}»` : 'Очистить поле';
}
