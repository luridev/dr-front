import MaskedNumber from 'imask/masked/number';
import type { FactoryOpts } from 'imask/masked/factory';

export const integerInputMinusSign = '-';

export const integerInputParams = {
  minusSign: integerInputMinusSign,
  thousandSeparator: '\u00A0',
};

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
