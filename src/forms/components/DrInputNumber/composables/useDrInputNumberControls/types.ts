import type { MaybeRefOrGetter, ModelRef } from 'vue';

export type DrInputNumberStepDirection = 'increment' | 'decrement';

export type UseDrInputNumberControlsParams = {
  model: ModelRef<number | null>;
  min: MaybeRefOrGetter<number | undefined>;
  max: MaybeRefOrGetter<number | undefined>;
  step: MaybeRefOrGetter<number>;
  disabled: MaybeRefOrGetter<boolean>;
};
