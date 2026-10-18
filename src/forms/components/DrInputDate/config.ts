import { dateInputMaskOptions } from '@/forms/lib/inputFormats/date/dateInputMask';
import type { DrInputMaskSettings } from '@/forms/components/DrInput/composables/useDrInputMask/types';

export const dateDrInputFormatSettings = {
  maskOptions: dateInputMaskOptions,
  inputMode: 'text',
} satisfies DrInputMaskSettings;
