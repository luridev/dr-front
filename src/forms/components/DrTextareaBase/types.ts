import type { HTMLAttributes } from 'vue';

export type DrTextareaBaseAria = {
  ariaInvalid?: boolean;
  ariaDescribedBy?: string | undefined;
};

export type DrTextareaBaseProps = {
  id?: string | undefined;
  maxLength?: number | undefined;
  placeholder?: string | undefined;
  rows?: number | undefined;
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
