import { timeInputConfigBySmallestUnit } from '@/forms/lib/inputFormats/time/config';
import type { MaskitoOptions, MaskitoPreprocessor } from '@maskito/core';
import type { TimeInputParseResult, TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

const timeInputDigitPattern = /[0-9]/;

function stringifyTimeInputSegment(value: number, length: number) {
  return String(value).padStart(length, '0');
}

function normalizeTimeInputInsertion(data: string) {
  const digits = data.replaceAll(/\D/g, '');
  const trailingSeparator = data.endsWith(':') ? ':' : data.endsWith('.') ? '.' : '';

  return `${digits}${trailingSeparator}`;
}

function findTimeInputReplacementEnd(value: string, from: number, to: number, digitCount: number) {
  let replacementEnd = from;
  let remainingDigitCount = digitCount;

  for (let index = from; index < to && remainingDigitCount > 0; index += 1) {
    if (timeInputDigitPattern.test(value[index] ?? '')) {
      replacementEnd = index + 1;
      remainingDigitCount -= 1;
    }
  }

  return replacementEnd;
}

function parseTimeInputFractionSegment(fraction: string, start: number) {
  const segment = fraction.slice(start, start + 3);

  return segment === '' ? 0 : Number(segment);
}

const timeInputPreprocessor: MaskitoPreprocessor = ({ elementState, data }, actionType) => {
  if (actionType === 'deleteBackward' || actionType === 'deleteForward') {
    const [from, to] = elementState.selection;

    if (elementState.value === '' || to >= elementState.value.length) {
      return { elementState, data };
    }

    const selectedValue = elementState.value.slice(from, to);
    const replacement = selectedValue.replaceAll(/[0-9]/g, '0');

    if (!timeInputDigitPattern.test(replacement)) {
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

  const normalizedData = normalizeTimeInputInsertion(data);

  if (normalizedData === '') {
    return { elementState, data: '' };
  }

  const [from, to] = elementState.selection;
  const digitCount = normalizedData.replaceAll(/\D/g, '').length;

  if (to > from && (normalizedData.length > 1 || to === elementState.value.length)) {
    return { elementState, data: normalizedData };
  }

  if (to === from && from === elementState.value.length) {
    return { elementState, data: normalizedData };
  }

  const replacementSearchEnd = to > from ? to : elementState.value.length;
  const replacementEnd = findTimeInputReplacementEnd(elementState.value, from, replacementSearchEnd, digitCount);

  return {
    elementState: {
      ...elementState,
      selection: [from, replacementEnd],
    },
    data: normalizedData,
  };
};

export const timeInputMaskOptionsBySmallestUnit = {
  minute: {
    mask: timeInputConfigBySmallestUnit.minute.mask,
    overwriteMode: 'shift',
    preprocessors: [timeInputPreprocessor],
  },
  second: {
    mask: timeInputConfigBySmallestUnit.second.mask,
    overwriteMode: 'shift',
    preprocessors: [timeInputPreprocessor],
  },
  millisecond: {
    mask: timeInputConfigBySmallestUnit.millisecond.mask,
    overwriteMode: 'shift',
    preprocessors: [timeInputPreprocessor],
  },
  microsecond: {
    mask: timeInputConfigBySmallestUnit.microsecond.mask,
    overwriteMode: 'shift',
    preprocessors: [timeInputPreprocessor],
  },
  nanosecond: {
    mask: timeInputConfigBySmallestUnit.nanosecond.mask,
    overwriteMode: 'shift',
    preprocessors: [timeInputPreprocessor],
  },
} satisfies Record<TimeInputSmallestUnit, MaskitoOptions>;

export function parseTimeInputValue(value: string, smallestUnit: TimeInputSmallestUnit): TimeInputParseResult {
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

  const hour = Number(match[1]);
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

export function stringifyTimeInputValue(value: Temporal.PlainTime | null, smallestUnit: TimeInputSmallestUnit): string {
  if (value == null) {
    return '';
  }

  let result = `${stringifyTimeInputSegment(value.hour, 2)}:${stringifyTimeInputSegment(value.minute, 2)}`;

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
