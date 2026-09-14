import {
  dateInputIncompletePattern,
  dateInputMask,
  dateInputPattern,
  dateInputYearStartIndex,
  getTemporalPlainDateMax,
  getTemporalPlainDateMin,
} from '@/forms/lib/inputFormats/date/config';
import type { MaskitoOptions, MaskitoPreprocessor } from '@maskito/core';
import type { DateInputParseResult } from '@/forms/lib/inputFormats/date/types';

const dateInputEditableCharacterPattern = /[0-9-]/;
const dateInputDigitPattern = /[0-9]/;

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

function normalizeDateInputInsertion(data: string) {
  return data.replaceAll(/[^0-9-]/g, '');
}

function isDateInputSeparatorInsertion(data: string, value: string, from: number, to: number) {
  return data === '.' && from === to && (from === 2 || from === dateInputYearStartIndex - 1) && from <= value.length;
}

function isDateInputYearSeparatorPending(value: string, selectionStart: number) {
  return selectionStart === dateInputYearStartIndex - 1 && /^\d{2}\.\d{2}$/.test(value);
}

function isDateInputMinusInsertionAllowed(data: string, value: string, selectionStart: number) {
  const firstMinusIndex = data.indexOf('-');

  if (firstMinusIndex < 0) {
    return true;
  }

  if (firstMinusIndex !== data.lastIndexOf('-')) {
    return false;
  }

  return (
    (selectionStart === 0 && firstMinusIndex === 4) ||
    (selectionStart === dateInputYearStartIndex && firstMinusIndex === 0) ||
    (isDateInputYearSeparatorPending(value, selectionStart) && firstMinusIndex === 0)
  );
}

function findDateInputReplacementEnd(value: string, from: number, to: number, characterCount: number) {
  let replacementEnd = from;
  let remainingCharacterCount = characterCount;

  for (let index = from; index < to && remainingCharacterCount > 0; index += 1) {
    if (dateInputEditableCharacterPattern.test(value[index] ?? '')) {
      replacementEnd = index + 1;
      remainingCharacterCount -= 1;
    }
  }

  return replacementEnd;
}

const dateInputPreprocessor: MaskitoPreprocessor = ({ elementState, data }, actionType) => {
  if (actionType === 'deleteBackward' || actionType === 'deleteForward') {
    const [from, to] = elementState.selection;

    if (elementState.value === '' || to >= elementState.value.length) {
      return { elementState, data };
    }

    const selectedValue = elementState.value.slice(from, to);

    if (selectedValue.includes('-')) {
      return { elementState, data };
    }

    const replacement = selectedValue.replaceAll(/[0-9]/g, '0');

    if (!dateInputDigitPattern.test(replacement)) {
      return { elementState, data };
    }

    return {
      elementState: {
        value: `${elementState.value.slice(0, from)}${replacement}${elementState.value.slice(to)}`,
        selection: [from, from],
      },
      data,
    };
  }

  if (actionType !== 'insert') {
    return { elementState, data };
  }

  const [from, to] = elementState.selection;

  if (isDateInputSeparatorInsertion(data, elementState.value, from, to)) {
    return { elementState, data };
  }

  const normalizedData = normalizeDateInputInsertion(data);

  if (normalizedData === '' || !isDateInputMinusInsertionAllowed(normalizedData, elementState.value, from)) {
    return { elementState, data: '' };
  }

  if (normalizedData === '-' && from === to && isDateInputYearSeparatorPending(elementState.value, from)) {
    return {
      elementState: {
        ...elementState,
        value: `${elementState.value}.`,
        selection: [dateInputYearStartIndex, dateInputYearStartIndex],
      },
      data: normalizedData,
    };
  }

  if (normalizedData === '-' && from === to && from === dateInputYearStartIndex) {
    return {
      elementState: {
        ...elementState,
        selection: [from, from],
      },
      data: normalizedData,
    };
  }

  if (
    to > from &&
    (elementState.value.slice(from, to).includes('-') || normalizedData.length > 1 || to === elementState.value.length)
  ) {
    return { elementState, data: normalizedData };
  }

  if (to === from && from === elementState.value.length) {
    return { elementState, data: normalizedData };
  }

  const replacementSearchEnd = to > from ? to : elementState.value.length;

  const replacementEnd = findDateInputReplacementEnd(
    elementState.value,
    from,
    replacementSearchEnd,
    normalizedData.length,
  );

  return {
    elementState: {
      ...elementState,
      selection: [from, replacementEnd],
    },
    data: normalizedData,
  };
};

export const dateInputMaskOptions = {
  mask: dateInputMask,
  overwriteMode: 'shift',
  preprocessors: [dateInputPreprocessor],
} satisfies MaskitoOptions;

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
