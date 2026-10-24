import { createTimeInputMaskOptions } from '@/forms/lib/inputFormats/time/timeInputMask';
import type { DrInputMaskSettings } from '@/forms/components/DrInput/composables/useDrInputMask/types';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

export function getTimeDrInputFormatSettings(
  smallestUnit: TimeInputSmallestUnit,
  hourCycle: InputLocaleProfile['time']['hourCycle'],
  fractionalSecondSeparator?: string,
): DrInputMaskSettings {
  return {
    maskOptions: createTimeInputMaskOptions(smallestUnit, hourCycle, fractionalSecondSeparator),
    inputMode: 'numeric',
  };
}
