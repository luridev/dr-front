import type { FactoryConstructorOpts, FactoryStaticOpts } from 'imask';
import type { Slot } from 'vue';
import type { DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';

type NativeMaskOptions = FactoryStaticOpts | FactoryConstructorOpts;

export type DrMask = string | (NativeMaskOptions & {
  mask: NonNullable<NativeMaskOptions['mask']>;
});

export type DrMaskedInputStatus = 'empty' | 'incomplete' | 'valid';

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
