import { timeInputMaskOptionsBySmallestUnit } from '@/forms/lib/inputFormats/time/timeInputFormat';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

export const timeDrInputFormatSettingsBySmallestUnit = {
  minute: {
    maskitoOptions: timeInputMaskOptionsBySmallestUnit.minute,
    inputMode: 'numeric',
  },
  second: {
    maskitoOptions: timeInputMaskOptionsBySmallestUnit.second,
    inputMode: 'numeric',
  },
  millisecond: {
    maskitoOptions: timeInputMaskOptionsBySmallestUnit.millisecond,
    inputMode: 'numeric',
  },
  microsecond: {
    maskitoOptions: timeInputMaskOptionsBySmallestUnit.microsecond,
    inputMode: 'numeric',
  },
  nanosecond: {
    maskitoOptions: timeInputMaskOptionsBySmallestUnit.nanosecond,
    inputMode: 'numeric',
  },
} satisfies Record<TimeInputSmallestUnit, DrInputInternalFormat>;
