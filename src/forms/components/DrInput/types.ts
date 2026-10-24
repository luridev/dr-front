import type { DrControlFieldProps } from '@/forms/components/DrControl/types';

export type DrInputAria = {
  ariaInvalid?: boolean;
  role?: string;
  ariaValueMin?: number;
  ariaValueMax?: number;
  ariaValueNow?: number;
  ariaValueText?: string;
  clearButtonAriaLabel?: string;
};

export type DrInputProps = DrControlFieldProps & {
  type?: string;
  clearable?: boolean;
  readonly?: boolean;
  placeholder?: string;
  autocomplete?: 'on' | 'off';
  aria?: DrInputAria;
};

export type DrInputEmits = {
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  wheel: [event: WheelEvent];
};

export type DrInputExposed = {
  focus(options?: FocusOptions): void;
  setCaretToEnd(): void;
};
