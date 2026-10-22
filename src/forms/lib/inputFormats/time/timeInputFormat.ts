import { timeInputConfigBySmallestUnit } from '@/forms/lib/inputFormats/time/config';
import type { TimeInputDayPeriod, TimeInputParseResult, TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

function stringifyTimeInputSegment(value: number, length: number) {
  return String(value).padStart(length, '0');
}

function parseTimeInputFractionSegment(fraction: string, start: number) {
  const segment = fraction.slice(start, start + 3);

  return segment === '' ? 0 : Number(segment);
}

export function parseTimeInputValue(
  value: string,
  smallestUnit: TimeInputSmallestUnit,
  hourCycle: 12 | 24 = 24,
  dayPeriod: TimeInputDayPeriod = 'am',
): TimeInputParseResult {
  if (value === '') {
    return { status: 'empty' };
  }

  const config = timeInputConfigBySmallestUnit[smallestUnit];
  const match = config.pattern.exec(value);

  if (match == null) {
    return {
      status: config.incompletePattern.test(value) ? 'incomplete' : 'invalid',
    };
  }

  let hour = Number(match[1]);

  if (hourCycle === 12) {
    if (hour < 1 || hour > 12) {
      return { status: 'invalid' };
    }

    hour = hour % 12 + (dayPeriod === 'pm' ? 12 : 0);
  }

  const minute = Number(match[2]);
  const second = Number(match.at(3) ?? 0);
  const fraction = (match.at(4) ?? '').padEnd(config.maximumFractionDigitLength, '0');
  const millisecond = parseTimeInputFractionSegment(fraction, 0);
  const microsecond = parseTimeInputFractionSegment(fraction, 3);
  const nanosecond = parseTimeInputFractionSegment(fraction, 6);

  try {
    return {
      status: 'valid',
      value: Temporal.PlainTime.from(
        {
          hour,
          minute,
          second,
          millisecond,
          microsecond,
          nanosecond,
        },
        {
          overflow: 'reject',
        },
      ),
    };
  } catch (error) {
    if (error instanceof RangeError) {
      return { status: 'invalid' };
    }

    throw error;
  }
}

export function stringifyTimeInputValue(
  value: Temporal.PlainTime | null,
  smallestUnit: TimeInputSmallestUnit,
  hourCycle: 12 | 24 = 24,
): string {
  if (value == null) {
    return '';
  }

  const hour = hourCycle === 12
    ? value.hour % 12 === 0 ? 12 : value.hour % 12
    : value.hour;

  let result = `${stringifyTimeInputSegment(hour, 2)}:${stringifyTimeInputSegment(value.minute, 2)}`;

  if (smallestUnit !== 'minute') {
    result += `:${stringifyTimeInputSegment(value.second, 2)}`;
  }

  if (smallestUnit === 'millisecond') {
    result += `.${stringifyTimeInputSegment(value.millisecond, 3)}`;
  }

  if (smallestUnit === 'microsecond') {
    result += `.${stringifyTimeInputSegment(value.millisecond, 3)}${stringifyTimeInputSegment(value.microsecond, 3)}`;
  }

  if (smallestUnit === 'nanosecond') {
    result += `.${stringifyTimeInputSegment(value.millisecond, 3)}${stringifyTimeInputSegment(
      value.microsecond,
      3,
    )}${stringifyTimeInputSegment(value.nanosecond, 3)}`;
  }

  return result;
}

export function getTimeInputDayPeriod(value: Temporal.PlainTime): TimeInputDayPeriod {
  return value.hour < 12 ? 'am' : 'pm';
}

export function retainTimeInputPrecision(
  value: Temporal.PlainTime,
  previous: Temporal.PlainTime | null,
  smallestUnit: TimeInputSmallestUnit,
): Temporal.PlainTime {
  if (previous === null) {
    return value;
  }

  const fractionDigits = timeInputConfigBySmallestUnit[smallestUnit].maximumFractionDigitLength;

  return value.with({
    second: smallestUnit === 'minute' ? previous.second : value.second,
    millisecond: fractionDigits < 3 ? previous.millisecond : value.millisecond,
    microsecond: fractionDigits < 6 ? previous.microsecond : value.microsecond,
    nanosecond: fractionDigits < 9 ? previous.nanosecond : value.nanosecond,
  });
}
