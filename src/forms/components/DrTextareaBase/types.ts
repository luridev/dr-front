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
  aria?: DrTextareaBaseAria;
};

export type DrTextareaBaseExposed = {
  focus: (options?: FocusOptions) => void;
};

export type DrTextareaBaseEmits = {
  blur: [event: FocusEvent];
  limitExceeded: [maxLength: number];
};
