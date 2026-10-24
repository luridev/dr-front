import type { TimeInputConfig } from '@/forms/lib/inputFormats/time/internal/types';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

const minutePattern = /^(\d{2}):(\d{2})$/;
const minuteIncompletePattern = /^\d{0,2}(?::\d{0,2})?$/;
const secondPattern = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
const secondIncompletePattern = /^\d{0,2}(?::\d{0,2}(?::\d{0,2})?)?$/;

export const defaultTimeInputSmallestUnit: TimeInputSmallestUnit = 'minute';

export const timeInputFractionDigitsBySmallestUnit = {
  minute: 0,
  second: 0,
  millisecond: 3,
  microsecond: 6,
  nanosecond: 9,
} as const satisfies Record<TimeInputSmallestUnit, number>;

export function getTimeInputFractionSeparatorPattern(separator: string): string {
  return `(?:${separator.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}|\\.)`;
}

export function getTimeInputConfig(smallestUnit: TimeInputSmallestUnit, separator: string): TimeInputConfig {
  const maximumFractionDigitLength = timeInputFractionDigitsBySmallestUnit[smallestUnit];

  if (smallestUnit === 'minute') {
    return { maximumFractionDigitLength, pattern: minutePattern, incompletePattern: minuteIncompletePattern };
  }

  if (smallestUnit === 'second') {
    return { maximumFractionDigitLength, pattern: secondPattern, incompletePattern: secondIncompletePattern };
  }

  const fractionSeparator = getTimeInputFractionSeparatorPattern(separator);

  return {
    maximumFractionDigitLength,
    pattern: new RegExp(`^(\\d{2}):(\\d{2})(?::(\\d{2})(?:${fractionSeparator}(\\d{1,${maximumFractionDigitLength}}))?)?$`),
    incompletePattern: new RegExp(`^\\d{0,2}(?::\\d{0,2}(?::\\d{0,2}(?:${fractionSeparator}\\d{0,${maximumFractionDigitLength}})?)?)?$`),
  };
}
