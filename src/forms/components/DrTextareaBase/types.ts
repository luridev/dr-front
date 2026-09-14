export type DrTextareaBaseResize = 'none' | 'vertical';

export type DrTextareaBaseAria = {
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
};

export type DrTextareaBaseProps = {
  id?: string;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  resize?: DrTextareaBaseResize;
  disabled?: boolean;
  aria?: DrTextareaBaseAria;
};

export type DrTextareaBaseExposed = {
  focus: (options?: FocusOptions) => void;
};

export type DrTextareaBaseEmits = {
  blur: [event: FocusEvent];
  limitExceeded: [maxLength: number];
};
