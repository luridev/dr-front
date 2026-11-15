import type { HTMLAttributes } from 'vue';
import type { DrControlFieldProps } from '@/forms/components/DrControl/types';

export type DrInputAria = {
  ariaInvalid?: boolean | undefined;
  role?: string;
  ariaValueMin?: number | undefined;
  ariaValueMax?: number | undefined;
  ariaValueNow?: number | undefined;
  ariaValueText?: string | undefined;
  clearButtonAriaLabel?: string | undefined;
};

export type DrInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

export type DrInputProps = DrControlFieldProps & {
  type?: DrInputType | undefined;
  clearable?: boolean;
  readonly?: boolean;
  placeholder?: string | undefined;
  maxLength?: number | undefined;
  autocomplete?: 'on' | 'off' | (string & {}) | undefined;
  inputMode?: HTMLAttributes['inputmode'];
  enterKeyHint?: HTMLAttributes['enterkeyhint'];
  spellCheck?: HTMLAttributes['spellcheck'];
  autoCapitalize?: HTMLAttributes['autocapitalize'];
  autoCorrect?: HTMLAttributes['autocorrect'];
  aria?: DrInputAria | undefined;
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
