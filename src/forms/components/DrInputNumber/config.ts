import { integerInputMaskOptions } from '@/forms/lib/inputFormats/integer/integerInputFormat';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';

export const numberDrInputFormatSettings = {
  maskitoOptions: integerInputMaskOptions,
  inputMode: 'numeric',
} satisfies DrInputInternalFormat;
