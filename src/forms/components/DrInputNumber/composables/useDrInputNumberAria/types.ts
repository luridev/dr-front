import type { MaybeRefOrGetter, ModelRef, Ref } from 'vue';

export type UseDrInputNumberAriaParams = {
  model: ModelRef<number | null>;
  inputValue: Readonly<Ref<string>>;
  min: MaybeRefOrGetter<number | undefined>;
  max: MaybeRefOrGetter<number | undefined>;
  isBoundsValid: MaybeRefOrGetter<boolean>;
  label: MaybeRefOrGetter<string | undefined>;
};
