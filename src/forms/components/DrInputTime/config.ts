import { createTimeInputMaskOptions } from '@/forms/lib/inputFormats/time/timeInputMask';
import type { DrInputMaskSettings } from '@/forms/components/DrInput/composables/useDrInputMask/types';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

export const timeDrInputFormatSettingsBySmallestUnit = {
  minute: {
    maskOptions: createTimeInputMaskOptions('minute'),
    inputMode: 'numeric',
  },
  second: {
    maskOptions: createTimeInputMaskOptions('second'),
    inputMode: 'numeric',
  },
  millisecond: {
    maskOptions: createTimeInputMaskOptions('millisecond'),
    inputMode: 'numeric',
  },
  microsecond: {
    maskOptions: createTimeInputMaskOptions('microsecond'),
    inputMode: 'numeric',
  },
  nanosecond: {
    maskOptions: createTimeInputMaskOptions('nanosecond'),
    inputMode: 'numeric',
  },
} satisfies Record<TimeInputSmallestUnit, DrInputMaskSettings>;
