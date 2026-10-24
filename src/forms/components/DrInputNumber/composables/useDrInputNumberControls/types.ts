import type { MaybeRefOrGetter, ModelRef } from 'vue';
import type { DrInputNumberStatus } from '@/forms/components/DrInputNumber/types';

export type DrInputNumberStepDirection = 'increment' | 'decrement';

export type UseDrInputNumberControlsParams = {
  model: ModelRef<number | null>;
  status: MaybeRefOrGetter<DrInputNumberStatus>;
  min: MaybeRefOrGetter<number | undefined>;
  max: MaybeRefOrGetter<number | undefined>;
  step: MaybeRefOrGetter<number>;
  disabled: MaybeRefOrGetter<boolean>;
};
