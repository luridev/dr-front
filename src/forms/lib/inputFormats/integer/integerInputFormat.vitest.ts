import { describe, expect, it } from 'vitest';
import {
  parseIntegerInputValue,
  stringifyIntegerInputValue,
} from '@/forms/lib/inputFormats/integer/integerInputFormat';

const thousandSeparator = '\u00A0';

describe('parseIntegerInputValue', () => {
  it.each([
    { source: '0', expected: 0 },
    { source: '-0', expected: 0 },
    { source: '1', expected: 1 },
    { source: '-1', expected: -1 },
    { source: '42', expected: 42 },
    { source: '-42', expected: -42 },
    { source: '00042', expected: 42 },
    { source: `1${thousandSeparator}234`, expected: 1234 },
    { source: `-1${thousandSeparator}234`, expected: -1234 },
  ])('parses integer $source as $expected', ({ source, expected }) => {
    const result = parseIntegerInputValue(source);

    expect(result).toBe(expected);
    expect(Object.is(result, -0)).toBe(false);
  });

  it.each(['', '-', '+', '+1', ' 1', '1 ', '1 000', '1.0', '1,0', '1.5', '1e3', 'Infinity', 'NaN', '12a', 'a12'])(
    'rejects invalid or incomplete input %j',
    (source) => {
      expect(parseIntegerInputValue(source)).toBeNull();
    },
  );

  it('accepts safe integer boundaries', () => {
    expect(parseIntegerInputValue(String(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
    expect(parseIntegerInputValue(String(Number.MIN_SAFE_INTEGER))).toBe(Number.MIN_SAFE_INTEGER);
  });

  it.each([
    String(Number.MAX_SAFE_INTEGER + 1),
    String(Number.MIN_SAFE_INTEGER - 1),
    '9007199254740993',
    '1'.repeat(400),
  ])('rejects integers outside the safe range: %s', (source) => {
    expect(parseIntegerInputValue(source)).toBeNull();
  });
});

describe('stringifyIntegerInputValue', () => {
  it.each([
    { value: null, expected: '' },
    { value: 0, expected: '0' },
    { value: -0, expected: '0' },
    { value: 1, expected: '1' },
    { value: -1, expected: '-1' },
    { value: 1234, expected: `1${thousandSeparator}234` },
    { value: -1234, expected: `-1${thousandSeparator}234` },
    {
      value: Number.MAX_SAFE_INTEGER,
      expected: `9${thousandSeparator}007${thousandSeparator}199${thousandSeparator}254${thousandSeparator}740${thousandSeparator}991`,
    },
  ])('formats $value as $expected', ({ value, expected }) => {
    expect(stringifyIntegerInputValue(value)).toBe(expected);
  });

  it.each([
    { value: 1.5, expected: '1.5' },
    { value: Number.POSITIVE_INFINITY, expected: 'Infinity' },
    { value: Number.NaN, expected: 'NaN' },
  ])('preserves the diagnostic representation of non-integer model $value', ({ value, expected }) => {
    expect(stringifyIntegerInputValue(value)).toBe(expected);
  });

  it.each([0, 1, -1, 42, -42, 1234, -1234])('supports round trips for %s', (value) => {
    expect(parseIntegerInputValue(stringifyIntegerInputValue(value))).toBe(value);
  });
});
