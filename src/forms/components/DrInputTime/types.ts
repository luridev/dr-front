import type { Slot } from 'vue';
import type { DrInputAria, DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';
import type { TimeInputSmallestUnit, TimeInputStatus } from '@/forms/lib/inputFormats/time/types';

export type DrInputTimeSmallestUnit = TimeInputSmallestUnit;

export type DrInputTimeStatus = TimeInputStatus;

export type DrInputTimeAria = Pick<DrInputAria, 'ariaInvalid' | 'clearButtonAriaLabel'>;

export type DrInputTimeProps = Omit<DrInputProps, 'aria' | 'type' | 'maxLength' | 'spellCheck' | 'autoCapitalize' | 'autoCorrect'> & {
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

export type DrInputTimeEmits = Pick<DrInputEmits, 'focus' | 'blur'> & {
  'update:status': [status: DrInputTimeStatus];
};
