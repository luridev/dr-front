import type { Slot } from 'vue';
import type { DrTypedInputStatus } from '@/forms/components/DrInput/composables/useDrTypedInputModel/types';
import type { DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';

export type DrMask = string | Readonly<{
  pattern: string;
  definitions?: Readonly<Record<string, RegExp>>;
}> | Readonly<{ type: 'integer' }>;

export type DrMaskedInputStatus = DrTypedInputStatus;

export type DrMaskedInputProps = Omit<DrInputProps, 'type'> & {
  mask: DrMask;
};

export type DrMaskedInputEmits = DrInputEmits & {
  'update:status': [status: DrMaskedInputStatus];
};

export type DrMaskedInputSlots = {
  label?: Slot;
  start?: Slot<{ inputId: string }>;
  end?: Slot<{ inputId: string }>;
};
