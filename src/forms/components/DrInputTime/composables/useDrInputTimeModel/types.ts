import type { MaybeRefOrGetter, ModelRef } from 'vue';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';
import type { TimeInputSmallestUnit, TimeInputStatus } from '@/forms/lib/inputFormats/time/types';

export type UseDrInputTimeModelParams = {
  model: ModelRef<Temporal.PlainTime | null>;
  profile: MaybeRefOrGetter<InputLocaleProfile['time']>;
  smallestUnit: MaybeRefOrGetter<TimeInputSmallestUnit>;
  disabled: MaybeRefOrGetter<boolean>;
  onStatusUpdate: (status: TimeInputStatus) => void;
};
