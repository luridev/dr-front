import type { FactoryOpts } from 'imask/masked/factory';
import type { ComputedRef, HTMLAttributes } from 'vue';

export type DrInputInternalFormat = Readonly<{
  maskOptions: FactoryOpts | null;
  format?: (value: string) => string;
  inputMode: HTMLAttributes['inputmode'];
}>;

export type DrInputInternalFormatSource = DrInputInternalFormat | ComputedRef<DrInputInternalFormat>;
