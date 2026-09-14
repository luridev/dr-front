import type { MaskitoOptions } from '@maskito/core';
import type { ComputedRef, HTMLAttributes } from 'vue';

export type DrInputInternalFormat = Readonly<{
  maskitoOptions: MaskitoOptions | null;
  inputMode: HTMLAttributes['inputmode'];
}>;

export type DrInputInternalFormatSource = DrInputInternalFormat | ComputedRef<DrInputInternalFormat>;
