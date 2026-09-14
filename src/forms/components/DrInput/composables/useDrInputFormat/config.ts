import { integerInputMaskOptions } from '@/forms/lib/inputFormats/integer/integerInputFormat';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';
import type { DrInputFormat } from '@/forms/lib/inputFormats/types';

export const defaultDrInputFormatSettings = {
  maskitoOptions: null,
  inputMode: undefined,
} satisfies DrInputInternalFormat;

export const integerDrInputFormatSettings = {
  maskitoOptions: integerInputMaskOptions,
  inputMode: 'numeric',
} satisfies DrInputInternalFormat;

export const inputFormatSettings = {
  integer: integerDrInputFormatSettings,
} satisfies Record<DrInputFormat['type'], DrInputInternalFormat>;
