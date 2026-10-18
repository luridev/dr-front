import type { DrMask } from '@/forms/components/DrMaskedInput/types';

export type DrMaskedInputStoryProps = {
  mask?: DrMask;
  externalValue?: string;
  readonly?: boolean;
  disabled?: boolean;
};
