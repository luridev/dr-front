import {
  dateInputIncompletePattern,
  dateInputPattern,
  getTemporalPlainDateMax,
  getTemporalPlainDateMin,
} from '@/forms/lib/inputFormats/date/config';
import type { DateInputParseResult } from '@/forms/lib/inputFormats/date/types';

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

export function parseDateInputValue(value: string): DateInputParseResult {
  if (value === '') {
    return { status: 'empty' };
  }

  const match = dateInputPattern.exec(value);

  if (match == null) {
    return {
      status: dateInputIncompletePattern.test(value) ? 'incomplete' : 'invalid',
    };
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

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

export function stringifyDateInputValue(value: Temporal.PlainDate | null): string {
  if (value == null) {
    return '';
  }

  const isoDate = value.withCalendar('iso8601');

  return [
    stringifyDateInputSegment(isoDate.day, 2),
    stringifyDateInputSegment(isoDate.month, 2),
    stringifyDateInputYear(isoDate.year),
  ].join('.');
}
