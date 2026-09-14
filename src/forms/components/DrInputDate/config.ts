import { dateInputMaskOptions } from '@/forms/lib/inputFormats/date/dateInputFormat';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';

export const dateDrInputFormatSettings = {
  maskitoOptions: dateInputMaskOptions,
  inputMode: 'text',
} satisfies DrInputInternalFormat;
