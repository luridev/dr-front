import type { Slot } from 'vue';
import type { DrInputAria, DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';
import type { DateInputStatus } from '@/forms/lib/inputFormats/date/types';

export type DrInputDateStatus = DateInputStatus;

export type DrInputDateAria = Pick<DrInputAria, 'clearButtonAriaLabel'>;

export type DrInputDateProps = Omit<DrInputProps, 'aria' | 'inputFormat' | 'type'> & {
  aria?: DrInputDateAria;
};

export type DrInputDateAffixSlotProps = {
  inputId: string;
};

export type DrInputDateSlots = {
  label?: Slot;
  start?: Slot<DrInputDateAffixSlotProps>;
  end?: Slot<DrInputDateAffixSlotProps>;
};

export type DrInputDateEmits = Pick<DrInputEmits, 'blur'> & {
  'update:status': [status: DrInputDateStatus];
};
