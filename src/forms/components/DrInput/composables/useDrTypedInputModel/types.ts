import type { MaybeRefOrGetter, ModelRef, Ref } from 'vue';

export type DrTypedInputStatus = 'empty' | 'incomplete' | 'invalid' | 'valid';

export type DrTypedInputParseResult<TValue, TAdditionalStatus extends string = never> =
  | {
    status: Exclude<DrTypedInputStatus | TAdditionalStatus, 'valid'>;
  }
  | {
    status: 'valid';
    value: TValue;
  };

export type UseDrTypedInputModelParams<
  TValue,
  TAdditionalStatus extends string = never,
  TFormatDependency = unknown,
> = {
  model: ModelRef<TValue | null>;
  formatSource?: MaybeRefOrGetter<TFormatDependency>;
  parse: (value: string) => DrTypedInputParseResult<TValue, TAdditionalStatus>;
  stringify: (value: TValue | null) => string;
  equals: (first: TValue, second: TValue) => boolean;
  onStatusUpdate: (status: DrTypedInputStatus | TAdditionalStatus) => void;
};

export type UseDrTypedInputModelResult = {
  inputValue: Readonly<Ref<string>>;
  updateInputValue: (value: string) => void;
};
