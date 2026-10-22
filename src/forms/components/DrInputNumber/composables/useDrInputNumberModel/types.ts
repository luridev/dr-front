import type { MaybeRefOrGetter, ModelRef } from 'vue';

export type UseDrInputNumberModelParams = {
  model: ModelRef<number | null>;
  thousandSeparator: MaybeRefOrGetter<string>;
};
