import type { DrInputAria, DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';
import type { IntegerInputStatus } from '@/forms/lib/inputFormats/integer/types';

export type DrInputNumberStatus = IntegerInputStatus;

export type DrInputNumberAria = Pick<DrInputAria, 'ariaInvalid' | 'clearButtonAriaLabel'>;

export type DrInputNumberProps = Omit<DrInputProps, 'aria' | 'type' | 'maxLength' | 'spellCheck' | 'autoCapitalize' | 'autoCorrect'> & {
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  aria?: DrInputNumberAria | undefined;
};

export type DrInputNumberEmits = Pick<DrInputEmits, 'focus' | 'blur'> & {
  'update:status': [status: DrInputNumberStatus];
};
