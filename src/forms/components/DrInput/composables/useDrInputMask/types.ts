import type { ModelRef, Ref } from 'vue';
import type { DrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';

export type UseDrInputMaskParams = {
  input: Readonly<Ref<HTMLInputElement | null>>;
  model: ModelRef<string>;
  settings: Readonly<Ref<DrInputInternalFormat>>;
  readonly: () => boolean;
};
