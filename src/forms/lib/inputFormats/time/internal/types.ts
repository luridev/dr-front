import type { MaskitoMaskExpression } from '@maskito/core';

export type TimeInputConfig = {
  incompletePattern: RegExp;
  mask: MaskitoMaskExpression;
  maximumFractionDigitLength: number;
  pattern: RegExp;
};
