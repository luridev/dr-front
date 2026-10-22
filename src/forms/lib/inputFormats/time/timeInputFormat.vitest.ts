import { describe, expect, it } from 'vitest';
import {
  getTimeInputDayPeriod,
  parseTimeInputValue,
  retainTimeInputPrecision,
  stringifyTimeInputValue,
} from '@/forms/lib/inputFormats/time/timeInputFormat';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

function expectValidTime(source: string, smallestUnit: TimeInputSmallestUnit, expected: string): Temporal.PlainTime {
  const result = parseTimeInputValue(source, smallestUnit);

  expect(result.status).toBe('valid');

  if (result.status !== 'valid') {
    throw new Error(`Expected ${source} to be a valid ${smallestUnit} time`);
  }

  expect(result.value.equals(Temporal.PlainTime.from(expected))).toBe(true);

  return result.value;
}

describe('parseTimeInputValue', () => {
  it.each([
    { source: '12:34', smallestUnit: 'minute' as const, expected: '12:34:00' },
    { source: '12:34:56', smallestUnit: 'second' as const, expected: '12:34:56' },
    { source: '12:34:56.123', smallestUnit: 'millisecond' as const, expected: '12:34:56.123' },
    { source: '12:34:56.123456', smallestUnit: 'microsecond' as const, expected: '12:34:56.123456' },
    { source: '12:34:56.123456789', smallestUnit: 'nanosecond' as const, expected: '12:34:56.123456789' },
  ])('parses $smallestUnit input $source', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '00:00', smallestUnit: 'minute' as const, expected: '00:00:00' },
    { source: '23:59', smallestUnit: 'minute' as const, expected: '23:59:00' },
    { source: '00:00:00', smallestUnit: 'second' as const, expected: '00:00:00' },
    { source: '23:59:59', smallestUnit: 'second' as const, expected: '23:59:59' },
    { source: '23:59:59.999', smallestUnit: 'millisecond' as const, expected: '23:59:59.999' },
    { source: '23:59:59.999999', smallestUnit: 'microsecond' as const, expected: '23:59:59.999999' },
    { source: '23:59:59.999999999', smallestUnit: 'nanosecond' as const, expected: '23:59:59.999999999' },
  ])('accepts time boundary $source for $smallestUnit', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '24:00', smallestUnit: 'minute' as const },
    { source: '00:60', smallestUnit: 'minute' as const },
    { source: '24:00:00', smallestUnit: 'second' as const },
    { source: '00:60:00', smallestUnit: 'second' as const },
    { source: '00:00:60', smallestUnit: 'second' as const },
    { source: '23:59:60.000', smallestUnit: 'millisecond' as const },
    { source: '24:00:00.000000', smallestUnit: 'microsecond' as const },
    { source: '00:60:00.000000000', smallestUnit: 'nanosecond' as const },
  ])('rejects out-of-range time $source for $smallestUnit', ({ source, smallestUnit }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: 'invalid' });
  });

  it.each([
    { source: '12:34', smallestUnit: 'second' as const, expected: '12:34:00' },
    { source: '12:34', smallestUnit: 'millisecond' as const, expected: '12:34:00' },
    { source: '12:34:56', smallestUnit: 'millisecond' as const, expected: '12:34:56' },
    { source: '12:34', smallestUnit: 'microsecond' as const, expected: '12:34:00' },
    { source: '12:34:56', smallestUnit: 'nanosecond' as const, expected: '12:34:56' },
  ])('fills missing lower-precision units with zeros in $source', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '12:34:56.1', smallestUnit: 'millisecond' as const, expected: '12:34:56.100' },
    { source: '12:34:56.01', smallestUnit: 'millisecond' as const, expected: '12:34:56.010' },
    { source: '12:34:56.001', smallestUnit: 'millisecond' as const, expected: '12:34:56.001' },
    { source: '12:34:56.120', smallestUnit: 'millisecond' as const, expected: '12:34:56.120' },
    { source: '12:34:56.1234', smallestUnit: 'microsecond' as const, expected: '12:34:56.123400' },
    { source: '12:34:56.123400', smallestUnit: 'microsecond' as const, expected: '12:34:56.123400' },
    { source: '12:34:56.000001', smallestUnit: 'microsecond' as const, expected: '12:34:56.000001' },
    { source: '12:34:56.1234567', smallestUnit: 'nanosecond' as const, expected: '12:34:56.123456700' },
    { source: '12:34:56.000000001', smallestUnit: 'nanosecond' as const, expected: '12:34:56.000000001' },
    { source: '12:34:56.999999999', smallestUnit: 'nanosecond' as const, expected: '12:34:56.999999999' },
  ])('right-pads the fraction for $smallestUnit input $source', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '12:34:56.1234', smallestUnit: 'millisecond' as const },
    { source: '12:34:56.1234567', smallestUnit: 'microsecond' as const },
    { source: '12:34:56.1234567890', smallestUnit: 'nanosecond' as const },
  ])('rejects fractions exceeding $smallestUnit precision', ({ source, smallestUnit }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: 'invalid' });
  });

  it.each([
    { source: '', smallestUnit: 'minute' as const, expected: 'empty' },
    { source: '1', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12:', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12:3', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12:34:', smallestUnit: 'second' as const, expected: 'incomplete' },
    { source: '12:34:5', smallestUnit: 'second' as const, expected: 'incomplete' },
    { source: '12:34:56.', smallestUnit: 'millisecond' as const, expected: 'incomplete' },
    { source: '12:34:56.', smallestUnit: 'microsecond' as const, expected: 'incomplete' },
    { source: '12:34:56.', smallestUnit: 'nanosecond' as const, expected: 'incomplete' },
  ])('returns $expected for incomplete $smallestUnit input $source', ({ source, smallestUnit, expected }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: expected });
  });

  it.each([
    { source: 'a', smallestUnit: 'minute' as const },
    { source: '12:34 ', smallestUnit: 'minute' as const },
    { source: ' 12:34', smallestUnit: 'minute' as const },
    { source: '12/34', smallestUnit: 'minute' as const },
    { source: '123:45', smallestUnit: 'minute' as const },
    { source: '12::34', smallestUnit: 'minute' as const },
    { source: '12:34:56', smallestUnit: 'minute' as const },
    { source: '12:34:56.1', smallestUnit: 'second' as const },
    { source: '12:34:56..1', smallestUnit: 'millisecond' as const },
    { source: '12:34:56.1a', smallestUnit: 'microsecond' as const },
    { source: '12:34:56.123:4', smallestUnit: 'nanosecond' as const },
  ])('rejects invalid syntax $source for $smallestUnit', ({ source, smallestUnit }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: 'invalid' });
  });
});

describe('12-hour time input', () => {
  it.each([
    { source: '12:00', period: 'am', expected: '00:00:00' },
    { source: '01:30', period: 'am', expected: '01:30:00' },
    { source: '11:59', period: 'am', expected: '11:59:00' },
    { source: '12:00', period: 'pm', expected: '12:00:00' },
    { source: '01:30', period: 'pm', expected: '13:30:00' },
    { source: '11:59', period: 'pm', expected: '23:59:00' },
  ] as const)('maps $source $period to model $expected and back', ({ source, period, expected }) => {
    const result = parseTimeInputValue(source, 'minute', 12, period);

    expect(result.status).toBe('valid');

    if (result.status === 'valid') {
      expect(result.value.toString()).toBe(expected);
      expect(getTimeInputDayPeriod(result.value)).toBe(period);
      expect(stringifyTimeInputValue(result.value, 'minute', 12)).toBe(source);
    }
  });

  it.each([
    { unit: 'minute', source: '11:45', expected: '23:45:00' },
    { unit: 'second', source: '11:45:56', expected: '23:45:56' },
    { unit: 'millisecond', source: '11:45:56.123', expected: '23:45:56.123' },
    { unit: 'microsecond', source: '11:45:56.123456', expected: '23:45:56.123456' },
    { unit: 'nanosecond', source: '11:45:56.123456789', expected: '23:45:56.123456789' },
  ] as const)('formats and parses $unit precision without adding a period suffix', ({ unit, source, expected }) => {
    const model = Temporal.PlainTime.from('23:45:56.123456789');
    const result = parseTimeInputValue(source, unit, 12, 'pm');

    expect(stringifyTimeInputValue(model, unit, 12)).toBe(source);
    expect(result.status).toBe('valid');

    if (result.status === 'valid') {
      expect(result.value.toString()).toBe(expected);
      expect(retainTimeInputPrecision(result.value, model, unit).equals(model)).toBe(true);
    }
  });

  it.each(['00:00', '13:00', '23:59'])('rejects a 24-hour-only value %s in both periods', (source) => {
    expect(parseTimeInputValue(source, 'minute', 12, 'am')).toEqual({ status: 'invalid' });
    expect(parseTimeInputValue(source, 'minute', 12, 'pm')).toEqual({ status: 'invalid' });
  });

  it.each([
    { source: '', unit: 'minute', status: 'empty' },
    { source: '11:1', unit: 'minute', status: 'incomplete' },
    { source: '11:11:5', unit: 'second', status: 'incomplete' },
    { source: '11:11:56.', unit: 'nanosecond', status: 'incomplete' },
    { source: '11:60', unit: 'minute', status: 'invalid' },
    { source: '11:11 PM', unit: 'minute', status: 'invalid' },
  ] as const)('preserves $status status for $source regardless of the period', ({ source, unit, status }) => {
    expect(parseTimeInputValue(source, unit, 12, 'am')).toEqual({ status });
    expect(parseTimeInputValue(source, unit, 12, 'pm')).toEqual({ status });
  });

  it('ignores the selected period in the 24-hour format and keeps empty models empty', () => {
    const result = parseTimeInputValue('23:45', 'minute', 24, 'am');

    expect(result.status).toBe('valid');

    if (result.status === 'valid') {
      expect(stringifyTimeInputValue(result.value, 'minute', 24)).toBe('23:45');
    }

    expect(stringifyTimeInputValue(null, 'minute', 12)).toBe('');
  });
});

describe('stringifyTimeInputValue', () => {
  const fullPrecisionValue = Temporal.PlainTime.from('01:02:03.004005006');

  it.each([
    { smallestUnit: 'minute' as const, expected: '01:02' },
    { smallestUnit: 'second' as const, expected: '01:02:03' },
    { smallestUnit: 'millisecond' as const, expected: '01:02:03.004' },
    { smallestUnit: 'microsecond' as const, expected: '01:02:03.004005' },
    { smallestUnit: 'nanosecond' as const, expected: '01:02:03.004005006' },
  ])('formats the model with $smallestUnit precision as $expected', ({ smallestUnit, expected }) => {
    expect(stringifyTimeInputValue(fullPrecisionValue, smallestUnit)).toBe(expected);
  });

  it('formats null as an empty string', () => {
    expect(stringifyTimeInputValue(null, 'minute')).toBe('');
  });

  it.each([
    { value: Temporal.PlainTime.from('12:34'), smallestUnit: 'minute' as const },
    { value: Temporal.PlainTime.from('12:34:56'), smallestUnit: 'second' as const },
    { value: Temporal.PlainTime.from('12:34:56.123'), smallestUnit: 'millisecond' as const },
    { value: Temporal.PlainTime.from('12:34:56.123456'), smallestUnit: 'microsecond' as const },
    { value: Temporal.PlainTime.from('12:34:56.123456789'), smallestUnit: 'nanosecond' as const },
  ])('supports round trips for $smallestUnit model $value', ({ value, smallestUnit }) => {
    const result = parseTimeInputValue(stringifyTimeInputValue(value, smallestUnit), smallestUnit);

    expect(result.status).toBe('valid');

    if (result.status === 'valid') {
      expect(result.value.equals(value)).toBe(true);
    }
  });
});
