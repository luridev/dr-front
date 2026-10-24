import type { Ref } from 'vue';
import type { DrMask, DrMaskedInputStatus } from '@/forms/components/DrMaskedInput/types';

export type UseDrMaskedInputModelParams = {
  model: Ref<string>;
  mask: Readonly<Ref<DrMask>>;
  onStatusUpdate: (status: DrMaskedInputStatus) => void;
};
