import IMask from 'imask/holder';
import { describe, expect, it } from 'vitest';
import { dateInputMaskOptions } from '@/forms/lib/inputFormats/date/config';
import { parseDateInputValue } from '@/forms/lib/inputFormats/date/dateInputFormat';

describe('date IMask contract', () => {
  it('replays a partial unmasked month without consuming the first year digit', () => {
    const mask = IMask.createMask(dateInputMaskOptions);
    mask.unmaskedValue = '01.0.100000';
    expect(mask.value).toMatch(/\.100000$/);
  });

  it.each(['01012026', '0101-100000', '1904-271821', '1309275760', '01010000'])(
    'accepts compact date %s with a valid Temporal value', (text) => {
      const mask = IMask.createMask(dateInputMaskOptions);
      mask.resolve(text);
      expect(parseDateInputValue(mask.value).status).toBe('valid');
      expect(mask.unmaskedValue).toBe(mask.value);
    },
  );

  it('inserts a year sign and replaces a fixed segment without consuming the year', () => {
    const mask = IMask.createMask(dateInputMaskOptions);
    mask.value = '01.02.100000';
    mask.splice(6, 0, '-');
    expect(mask.value).toBe('01.02.-100000');
    mask.splice(3, 2, '0');
    mask.splice(4, 0, '3');
    expect(mask.value).toBe('01.03.-100000');
  });
});
