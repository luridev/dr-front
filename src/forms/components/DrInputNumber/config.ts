import { integerInputMaskOptions } from '@/forms/lib/inputFormats/integer/config';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';

export const numberDrInputFormatSettings = {
  maskOptions: integerInputMaskOptions,
  inputMode: 'numeric',
} satisfies DrInputInternalFormat;
