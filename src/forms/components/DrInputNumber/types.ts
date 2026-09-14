import type { DrInputAria, DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';

export type DrInputNumberAria = Pick<DrInputAria, 'clearButtonAriaLabel'>;

export type DrInputNumberProps = Omit<DrInputProps, 'aria' | 'inputFormat' | 'type'> & {
  min?: number;
  max?: number;
  step?: number;
  aria?: DrInputNumberAria;
};

export type DrInputNumberEmits = Pick<DrInputEmits, 'blur'>;
