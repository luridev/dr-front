import MaskedNumber from 'imask/masked/number';
import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';
import type { FactoryOpts } from 'imask/masked/factory';

export const integerInputMaskOptions = {
  mask: MaskedNumber,
  scale: 0,
  thousandsSeparator: integerInputParams.thousandSeparator,
  min: -Infinity,
  max: Infinity,
  normalizeZeros: false,
  mapToRadix: [],
  parse: () => 0,
} satisfies FactoryOpts;
