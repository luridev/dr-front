import { integerInputMaskOptions } from '@/forms/lib/inputFormats/integer/config';
import { formatIntegerInputString } from '@/forms/lib/inputFormats/integer/integerInputFormat';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';
import type { DrInputFormat } from '@/forms/lib/inputFormats/types';

export const defaultDrInputFormatSettings = {
  maskOptions: null,
  inputMode: undefined,
} satisfies DrInputInternalFormat;

export const integerDrInputFormatSettings = {
  maskOptions: integerInputMaskOptions,
  format: formatIntegerInputString,
  inputMode: 'numeric',
} satisfies DrInputInternalFormat;

export const inputFormatSettings = {
  integer: integerDrInputFormatSettings,
} satisfies Record<DrInputFormat['type'], DrInputInternalFormat>;
