import { describe, expect, it } from 'vitest';
import { getTemporalPlainDateMax, getTemporalPlainDateMin } from '@/forms/lib/inputFormats/date/config';

describe('Границы Temporal.PlainDate', () => {
  it('проверяет минимальную поддерживаемую дату', () => {
    expect(() => getTemporalPlainDateMin().subtract({ days: 1 })).toThrow(RangeError);
  });

  it('проверяет максимальную поддерживаемую дату', () => {
    expect(() => getTemporalPlainDateMax().add({ days: 1 })).toThrow(RangeError);
  });
});
