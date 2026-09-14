import type { Slot } from 'vue';
import type { DrInputAria, DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';
import type { TimeInputSmallestUnit, TimeInputStatus } from '@/forms/lib/inputFormats/time/types';

export type DrInputTimeSmallestUnit = TimeInputSmallestUnit;

export type DrInputTimeStatus = TimeInputStatus;

export type DrInputTimeAria = Pick<DrInputAria, 'clearButtonAriaLabel'>;

export type DrInputTimeProps = Omit<DrInputProps, 'aria' | 'inputFormat' | 'type'> & {
  smallestUnit?: DrInputTimeSmallestUnit;
  aria?: DrInputTimeAria;
};

export type DrInputTimeAffixSlotProps = {
  inputId: string;
};

export type DrInputTimeSlots = {
  label?: Slot;
  start?: Slot<DrInputTimeAffixSlotProps>;
  end?: Slot<DrInputTimeAffixSlotProps>;
};

export type DrInputTimeEmits = Pick<DrInputEmits, 'blur'> & {
  'update:status': [status: DrInputTimeStatus];
};
