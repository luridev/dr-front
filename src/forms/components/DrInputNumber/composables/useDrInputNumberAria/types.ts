import type { MaybeRefOrGetter, ModelRef, Ref } from 'vue';
import type { DrInputNumberStatus } from '@/forms/components/DrInputNumber/types';

export type UseDrInputNumberAriaParams = {
  model: ModelRef<number | null>;
  inputValue: Readonly<Ref<string>>;
  status: MaybeRefOrGetter<DrInputNumberStatus>;
  min: MaybeRefOrGetter<number | undefined>;
  max: MaybeRefOrGetter<number | undefined>;
  isBoundsValid: MaybeRefOrGetter<boolean>;
  label: MaybeRefOrGetter<string | undefined>;
};
