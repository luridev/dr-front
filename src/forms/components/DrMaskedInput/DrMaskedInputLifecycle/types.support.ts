export type DrMaskedInputLifecycleProps = {
  variant?: 'pattern' | 'nested' | 'exposed' | 'prepared' | 'reactive' | 'number' | 'dynamic' | 'replacement';
  externalValue?: string;
  readonly?: boolean;
  disabled?: boolean;
  visible?: boolean;
};

export type DrMaskedInputReplacementOptions = {
  mask: string;
  validate?: (input: string) => boolean;
} | {
  mask: NumberConstructor;
  scale: number;
  max: number;
};
