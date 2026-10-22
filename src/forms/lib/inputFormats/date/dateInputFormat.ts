import {
  getTemporalPlainDateMax,
  getTemporalPlainDateMin,
} from '@/forms/lib/inputFormats/date/config';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';
import type { DateInputParseResult } from '@/forms/lib/inputFormats/date/types';

function getDateInputPatterns(profile: InputLocaleProfile['date']) {
  const separators = profile.separators.map((separator) => separator.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const segments = profile.order.map((part) => part === 'year' ? '(-?\\d{1,6})' : '(\\d{2})');

  const incompleteSegments = profile.order.map((part, index) => part === 'year'
    ? index === 2 ? '-?' : '-?\\d{0,6}'
    : index === 2 ? '\\d{0,1}' : '\\d{0,2}');

  return {
    complete: new RegExp(`^${segments[0]}${separators[0]}${segments[1]}${separators[1]}${segments[2]}$`),
    incomplete: new RegExp(
      `^${incompleteSegments[0]}(?:${separators[0]}${incompleteSegments[1]}(?:${separators[1]}${incompleteSegments[2]})?)?$`,
    ),
  };
}

function stringifyDateInputSegment(value: number, length: number) {
  return String(value).padStart(length, '0');
}

function stringifyDateInputYear(year: number) {
  const sign = year < 0 ? '-' : '';

  return `${sign}${stringifyDateInputSegment(Math.abs(year), 4)}`;
}

function isDateInputCalendarDateValid(year: number, month: number, day: number) {
  try {
    Temporal.PlainMonthDay.from(
      {
        year,
        month,
        day,
      },
      {
        overflow: 'reject',
      },
    );

    return true;
  } catch (error) {
    if (error instanceof RangeError) {
      return false;
    }

    throw error;
  }
}

function compareDateInputPartsWithPlainDate(year: number, month: number, day: number, value: Temporal.PlainDate) {
  if (year !== value.year) {
    return year < value.year ? -1 : 1;
  }

  if (month !== value.month) {
    return month < value.month ? -1 : 1;
  }

  if (day !== value.day) {
    return day < value.day ? -1 : 1;
  }

  return 0;
}

function isDateInputValueOutOfRange(year: number, month: number, day: number) {
  return (
    compareDateInputPartsWithPlainDate(year, month, day, getTemporalPlainDateMin()) < 0 ||
    compareDateInputPartsWithPlainDate(year, month, day, getTemporalPlainDateMax()) > 0
  );
}

export function parseDateInputValue(value: string, profile: InputLocaleProfile['date']): DateInputParseResult {
  if (value === '') {
    return { status: 'empty' };
  }

  const patterns = getDateInputPatterns(profile);
  const match = patterns.complete.exec(value);

  if (match == null) {
    return {
      status: patterns.incomplete.test(value) ? 'incomplete' : 'invalid',
    };
  }

  const parts = { year: 0, month: 0, day: 0 };

  profile.order.forEach((part, index) => {
    parts[part] = Number(match[index + 1]);
  });

  const { year, month, day } = parts;

  if (!isDateInputCalendarDateValid(year, month, day)) {
    return { status: 'invalid' };
  }

  if (isDateInputValueOutOfRange(year, month, day)) {
    return { status: 'out-of-range' };
  }

  try {
    return {
      status: 'valid',
      value: Temporal.PlainDate.from(
        {
          year,
          month,
          day,
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

export function stringifyDateInputValue(value: Temporal.PlainDate | null, profile: InputLocaleProfile['date']): string {
  if (value == null) {
    return '';
  }

  const isoDate = value.withCalendar('iso8601');

  return profile.order.map((part, index) => {
    const segment = part === 'year'
      ? stringifyDateInputYear(isoDate.year)
      : stringifyDateInputSegment(isoDate[part], 2);

    return `${segment}${profile.separators[index] ?? ''}`;
  }).join('');
}
