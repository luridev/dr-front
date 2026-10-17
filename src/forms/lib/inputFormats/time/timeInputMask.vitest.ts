import IMask from 'imask/holder';
import { describe, expect, it } from 'vitest';
import { parseTimeInputValue, retainTimeInputPrecision } from '@/forms/lib/inputFormats/time/timeInputFormat';
import { createTimeInputMaskOptions } from '@/forms/lib/inputFormats/time/timeInputMask';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

describe('time IMask contract', () => {
  it('replays a partial unmasked minute without shifting seconds or fractions', () => {
    const mask = IMask.createMask(createTimeInputMaskOptions('nanosecond'));
    mask.unmaskedValue = '12:4:56.123456789';
    expect(mask.value).toBe('12:04:56.123456789');
  });

  it.each<[TimeInputSmallestUnit, string, string]>([
    ['minute', '1234', '12:34'], ['second', '123456', '12:34:56'],
    ['millisecond', '123456123', '12:34:56.123'],
    ['microsecond', '123456123456', '12:34:56.123456'],
    ['nanosecond', '123456123456789', '12:34:56.123456789'],
  ])('preserves compact %s input', (unit, text, expected) => {
    const mask = IMask.createMask(createTimeInputMaskOptions(unit));
    mask.resolve(text);
    expect(mask.value).toBe(expected);
    expect(mask.unmaskedValue).toBe(expected);
    expect(parseTimeInputValue(mask.value, unit).status).toBe('valid');
  });

  it('keeps a short last integer segment incomplete', () => {
    const mask = IMask.createMask(createTimeInputMaskOptions('second'));
    mask.resolve('12:34:5');
    expect(mask.value).toBe('12:34:5');
    expect(parseTimeInputValue(mask.value, 'second')).toEqual({ status: 'incomplete' });
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
