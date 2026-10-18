import type { Ref } from 'vue';
import type { DrMaskCodec } from '@/forms/components/DrMaskedInput/lib/maskCodec/types';
import type { DrMaskedInputStatus } from '@/forms/components/DrMaskedInput/types';

export type UseDrMaskedInputModelParams = {
  model: Ref<string>;
  codec: Readonly<Ref<DrMaskCodec>>;
  onStatusUpdate: (status: DrMaskedInputStatus) => void;
};
