import IMask from 'imask/holder';
import { describe, expect, it } from 'vitest';
import { integerInputMaskOptions, integerInputParams } from '@/forms/lib/inputFormats/integer/config';

describe('integer IMask string contract', () => {
  it.each(['0', '-', '9007199254740991', '-9007199254740993', `-${'1234567890'.repeat(40)}`])(
    'preserves all draft digits for %s', (value) => {
      const mask = IMask.createMask(integerInputMaskOptions);
      mask.value = value;
      mask.doCommit();
      expect(mask.value.replaceAll(integerInputParams.thousandSeparator, '')).toBe(value);
    },
  );

  it('replays a huge unmasked value without a numeric round trip', () => {
    const value = '1234567890'.repeat(40);
    const mask = IMask.createMask(integerInputMaskOptions);
    mask.unmaskedValue = value;
    expect(mask.unmaskedValue).toBe(value);
  });
});
