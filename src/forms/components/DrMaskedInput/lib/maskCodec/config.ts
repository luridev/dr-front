import { DraftIntegerMask } from '@/forms/components/DrMaskedInput/lib/maskCodec/DraftIntegerMask';
import { integerInputMaskOptions } from '@/forms/lib/inputFormats/integer/integerInputMask';
import type { FactoryOpts } from 'imask/masked/factory';

export const draftIntegerMaskOptions = {
  ...integerInputMaskOptions,
  mask: DraftIntegerMask,
  validate: (value: string) => /^-?[\d\u00a0]*$/.test(value),
} satisfies FactoryOpts;
