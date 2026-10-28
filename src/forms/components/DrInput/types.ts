import type { HTMLAttributes } from 'vue';
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

export type DrInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

export type DrInputProps = DrControlFieldProps & {
  type?: DrInputType;
  clearable?: boolean;
  readonly?: boolean;
  placeholder?: string;
  maxLength?: number;
  autocomplete?: 'on' | 'off' | (string & {});
  inputMode?: HTMLAttributes['inputmode'];
  enterKeyHint?: HTMLAttributes['enterkeyhint'];
  spellCheck?: HTMLAttributes['spellcheck'];
  autoCapitalize?: HTMLAttributes['autocapitalize'];
  autoCorrect?: HTMLAttributes['autocorrect'];
  aria?: DrInputAria;
};

export type DrInputEmits = {
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  limitExceeded: [maxLength: number];
  keydown: [event: KeyboardEvent];
  wheel: [event: WheelEvent];
};

export type DrInputExposed = {
  focus(options?: FocusOptions): void;
  setCaretToEnd(): void;
};
