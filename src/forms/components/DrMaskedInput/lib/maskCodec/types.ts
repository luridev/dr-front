import type { FactoryOpts } from 'imask/masked/factory';
import type { DrMaskedInputStatus } from '@/forms/components/DrMaskedInput/types';

export type DrMaskValue = {
  display: string;
  canonical: string;
  status: DrMaskedInputStatus;
};

export type DrMaskCodec = {
  key: string;
  options: FactoryOpts;
  inputMode: 'text' | 'numeric';
  read(display: string): DrMaskValue;
  write(canonical: string): DrMaskValue;
};
