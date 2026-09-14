import type { TimeInputConfig } from '@/forms/lib/inputFormats/time/internal/types';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

const timeInputDigit = /[0-9]/;

const minuteMask = [timeInputDigit, timeInputDigit, ':', timeInputDigit, timeInputDigit];
const secondMask = [...minuteMask, ':', timeInputDigit, timeInputDigit];
const millisecondMask = [...secondMask, '.', timeInputDigit, timeInputDigit, timeInputDigit];
const microsecondMask = [...millisecondMask, timeInputDigit, timeInputDigit, timeInputDigit];
const nanosecondMask = [...microsecondMask, timeInputDigit, timeInputDigit, timeInputDigit];

const minutePattern = /^(\d{2}):(\d{2})$/;
const minuteIncompletePattern = /^\d{0,2}(?::\d{0,2})?$/;
const secondPattern = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
const secondIncompletePattern = /^\d{0,2}(?::\d{0,2}(?::\d{0,2})?)?$/;

function createFractionPattern(maximumFractionDigitLength: number) {
  return new RegExp(`^(\\d{2}):(\\d{2})(?::(\\d{2})(?:\\.(\\d{1,${maximumFractionDigitLength}}))?)?$`);
}

function createFractionIncompletePattern(maximumFractionDigitLength: number) {
  return new RegExp(`^\\d{0,2}(?::\\d{0,2}(?::\\d{0,2}(?:\\.\\d{0,${maximumFractionDigitLength}})?)?)?$`);
}

export const defaultTimeInputSmallestUnit: TimeInputSmallestUnit = 'minute';

export const timeInputConfigBySmallestUnit = {
  minute: {
    incompletePattern: minuteIncompletePattern,
    mask: minuteMask,
    maximumFractionDigitLength: 0,
    pattern: minutePattern,
  },
  second: {
    incompletePattern: secondIncompletePattern,
    mask: secondMask,
    maximumFractionDigitLength: 0,
    pattern: secondPattern,
  },
  millisecond: {
    incompletePattern: createFractionIncompletePattern(3),
    mask: millisecondMask,
    maximumFractionDigitLength: 3,
    pattern: createFractionPattern(3),
  },
  microsecond: {
    incompletePattern: createFractionIncompletePattern(6),
    mask: microsecondMask,
    maximumFractionDigitLength: 6,
    pattern: createFractionPattern(6),
  },
  nanosecond: {
    incompletePattern: createFractionIncompletePattern(9),
    mask: nanosecondMask,
    maximumFractionDigitLength: 9,
    pattern: createFractionPattern(9),
  },
} satisfies Record<TimeInputSmallestUnit, TimeInputConfig>;
