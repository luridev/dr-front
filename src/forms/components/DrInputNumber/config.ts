import { integerInputMaskOptions } from '@/forms/lib/inputFormats/integer/integerInputMask';
import type { DrInputMaskSettings } from '@/forms/components/DrInput/composables/useDrInputMask/types';

export const numberDrInputFormatSettings = {
  maskOptions: integerInputMaskOptions,
  inputMode: 'numeric',
} satisfies DrInputMaskSettings;
