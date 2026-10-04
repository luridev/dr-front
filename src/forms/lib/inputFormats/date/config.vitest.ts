import { describe, expect, it } from 'vitest';
import { getTemporalPlainDateMax, getTemporalPlainDateMin } from '@/forms/lib/inputFormats/date/config';

describe('Temporal.PlainDate boundaries', () => {
  it('checks the minimum supported date', () => {
    expect(() => getTemporalPlainDateMin().subtract({ days: 1 })).toThrow(RangeError);
  });

  it('checks the maximum supported date', () => {
    expect(() => getTemporalPlainDateMax().add({ days: 1 })).toThrow(RangeError);
  });
});
