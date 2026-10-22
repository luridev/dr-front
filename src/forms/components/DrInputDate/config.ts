import { getDateInputMaskOptions } from '@/forms/lib/inputFormats/date/dateInputMask';
import type { DrInputMaskSettings } from '@/forms/components/DrInput/composables/useDrInputMask/types';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';

export function getDateDrInputFormatSettings(profile: InputLocaleProfile['date']): DrInputMaskSettings {
  return {
    maskOptions: getDateInputMaskOptions(profile),
    inputMode: 'text',
  };
}
