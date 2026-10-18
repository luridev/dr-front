import type { FactoryOpts } from 'imask/masked/factory';
import type { ComputedRef, HTMLAttributes, Ref } from 'vue';
import type { DrInputEditorParams } from '@/forms/components/DrInput/composables/useDrInputEditor/types';

export type DrInputMaskSettings = Readonly<{
  maskOptions: FactoryOpts | null;
  format?: (value: string) => string;
  inputMode: HTMLAttributes['inputmode'];
}>;

export type DrInputMaskSource = DrInputMaskSettings | ComputedRef<DrInputMaskSettings>;

export type UseDrInputMaskParams = DrInputEditorParams & {
  settings: Readonly<Ref<DrInputMaskSettings>>;
};
