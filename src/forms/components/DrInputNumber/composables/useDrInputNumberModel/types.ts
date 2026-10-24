import type { MaybeRefOrGetter, ModelRef } from 'vue';
import type { DrInputNumberStatus } from '@/forms/components/DrInputNumber/types';

export type UseDrInputNumberModelParams = {
  model: ModelRef<number | null>;
  thousandSeparator: MaybeRefOrGetter<string>;
  onStatusUpdate: (status: DrInputNumberStatus) => void;
};
