import { dateInputMaskOptions } from '@/forms/lib/inputFormats/date/config';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';

export const dateDrInputFormatSettings = {
  maskOptions: dateInputMaskOptions,
  inputMode: 'text',
} satisfies DrInputInternalFormat;
