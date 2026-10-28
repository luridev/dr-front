import type { HTMLAttributes } from 'vue';

export type DrTextareaBaseAria = {
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
};

export type DrTextareaBaseProps = {
  id?: string;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
  inputMode?: HTMLAttributes['inputmode'];
  enterKeyHint?: HTMLAttributes['enterkeyhint'];
  spellCheck?: HTMLAttributes['spellcheck'];
  autoCapitalize?: HTMLAttributes['autocapitalize'];
  autoCorrect?: HTMLAttributes['autocorrect'];
  aria?: DrTextareaBaseAria;
};

export type DrTextareaBaseExposed = {
  focus: (options?: FocusOptions) => void;
};

export type DrTextareaBaseEmits = {
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  limitExceeded: [maxLength: number];
};
