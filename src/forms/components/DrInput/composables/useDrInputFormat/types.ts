import type { MaybeRefOrGetter } from 'vue';
import type { DrInputFormat } from '@/forms/lib/inputFormats/types';

export type UseDrInputFormatParams = {
  inputFormat: MaybeRefOrGetter<DrInputFormat | undefined>;
};
