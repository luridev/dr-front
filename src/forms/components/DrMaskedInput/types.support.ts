import type { nativeMasks } from '@/forms/components/DrMaskedInput/config.support';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

export type DrMaskedInputStoryProps = {
  mask?: DrMask;
  variant?: keyof typeof nativeMasks;
  externalValue?: string;
  readonly?: boolean;
  disabled?: boolean;
};
