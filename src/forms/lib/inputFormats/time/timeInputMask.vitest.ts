import IMask from 'imask/holder';
import { describe, expect, it } from 'vitest';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { parseTimeInputValue, retainTimeInputPrecision } from '@/forms/lib/inputFormats/time/timeInputFormat';
import { createTimeInputMaskOptions } from '@/forms/lib/inputFormats/time/timeInputMask';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

describe.each([12, 24] as const)('%i-hour IMask contract', (hourCycle) => {
  it('replays a partial unmasked minute without shifting seconds or fractions', () => {
    const mask = IMask.createMask(createTimeInputMaskOptions('nanosecond', hourCycle));
    mask.unmaskedValue = '12:4:56.123456789';
    expect(mask.value).toBe('12:04:56.123456789');
  });

  it.each<[TimeInputSmallestUnit, string, string]>([
    ['minute', '1234', '12:34'], ['second', '123456', '12:34:56'],
    ['millisecond', '123456123', '12:34:56.123'],
    ['microsecond', '123456123456', '12:34:56.123456'],
    ['nanosecond', '123456123456789', '12:34:56.123456789'],
  ])('preserves compact %s input', (unit, text, expected) => {
    const mask = IMask.createMask(createTimeInputMaskOptions(unit, hourCycle));
    mask.resolve(text);
    expect(mask.value).toBe(expected);
    expect(mask.unmaskedValue).toBe(expected);
    expect(parseTimeInputValue(mask.value, unit, hourCycle).status).toBe('valid');
  });

  it('keeps a short last integer segment incomplete', () => {
    const mask = IMask.createMask(createTimeInputMaskOptions('second', hourCycle));
    mask.resolve('12:34:5');
    expect(mask.value).toBe('12:34:5');
    expect(parseTimeInputValue(mask.value, 'second', hourCycle)).toEqual({ status: 'incomplete' });
  });

  it('preserves seconds and fractions during middle-segment replacement', () => {
    const mask = IMask.createMask(createTimeInputMaskOptions('nanosecond', hourCycle));
    mask.value = '12:34:56.123456789';
    mask.splice(3, 2, '0');
    mask.splice(4, 0, '5');

    expect(mask.value).toBe('12:05:56.123456789');
    expect(mask.unmaskedValue).toBe(mask.value);
  });
});

it.each([
  { hourCycle: 12, source: '00:30', expected: '01:30' },
  { hourCycle: 12, source: '13:30', expected: '12:30' },
  { hourCycle: 24, source: '00:30', expected: '00:30' },
  { hourCycle: 24, source: '23:30', expected: '23:30' },
] as const)('applies $hourCycle-hour mask bounds to $source', ({ hourCycle, source, expected }) => {
  const mask = IMask.createMask(createTimeInputMaskOptions('minute', hourCycle));
  mask.resolve(source);

  expect(mask.value).toBe(expected);
  expect(parseTimeInputValue(mask.value, 'minute', hourCycle).status).toBe('valid');
});

describe.each(['ru-RU', 'en-US', 'en-GB'] as const)('localized time mask: %s', (locale) => {
  const { hourCycle, fractionalSecondSeparator: separator } = getInputLocaleProfile(locale).time;

  it.each([
    ['millisecond', '001'], ['microsecond', '001002'], ['nanosecond', '001002003'],
  ] as const)('accepts localized, compact and dot-separated %s input', (unit, fraction) => {
    const mask = IMask.createMask(createTimeInputMaskOptions(unit, hourCycle, separator));
    const expected = `11:45:56${separator}${fraction}`;

    for (const text of [expected, `114556${fraction}`, `11:45:56.${fraction}`]) {
      mask.resolve(text);
      expect(mask.value).toBe(expected);
      expect(mask.unmaskedValue).toBe(expected);
      const result = parseTimeInputValue(mask.value, unit, hourCycle, 'pm', separator);

      expect(result.status).toBe('valid');

      if (result.status === 'valid') {
        expect(result.value.toString()).toBe(`${hourCycle === 12 ? '23' : '11'}:45:56.${fraction}`);
      }
    }
  });

  it('replays short seconds without moving fractional digits into the seconds', () => {
    const mask = IMask.createMask(createTimeInputMaskOptions('nanosecond', hourCycle, separator));

    for (const sourceSeparator of [separator, '.']) {
      mask.unmaskedValue = `11:45:6${sourceSeparator}001002003`;
      expect(mask.value).toBe(`11:45:06${separator}001002003`);
    }

    mask.unmaskedValue = `1:2:3${separator}4`;
    expect(mask.value).toBe(`01:02:03${separator}4`);
    mask.resolve('11:45:5');
    expect(mask.value).toBe('11:45:5');
    mask.unmaskedValue = '11:45:5';
    expect(mask.value).toBe('11:45:05');
  });

  it('accepts a typed alternative separator and leaves fractional tails unpadded during deletion', () => {
    const mask = IMask.createMask(createTimeInputMaskOptions('millisecond', hourCycle, separator));
    mask.resolve('11:45:56');
    mask.append('.', { input: true });
    expect(mask.value).toBe(`11:45:56${separator}`);
    mask.append('12', { input: true });
    expect(mask.value).toBe(`11:45:56${separator}12`);
    mask.splice(9, 1, '');
    expect(mask.value).toBe(`11:45:56${separator}2`);
  });
});

describe('hidden time precision', () => {
  it.each<[TimeInputSmallestUnit, string]>([
    ['minute', '01:02:56.123456789'], ['second', '01:02:03.123456789'],
    ['millisecond', '01:02:03.004456789'], ['microsecond', '01:02:03.004005789'],
    ['nanosecond', '01:02:03.004005006'],
  ])('retains only hidden %s fields', (unit, expected) => {
    const value = Temporal.PlainTime.from('01:02:03.004005006');
    const previous = Temporal.PlainTime.from('12:34:56.123456789');
    expect(retainTimeInputPrecision(value, previous, unit).toString()).toBe(expected);
    expect(retainTimeInputPrecision(value, null, unit)).toBe(value);
  });
});
