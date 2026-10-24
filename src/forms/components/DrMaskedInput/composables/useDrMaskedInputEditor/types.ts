import type { FactoryReturnMasked, FactoryOpts } from 'imask';
import type { Ref } from 'vue';
import type { DrInputEditorParams } from '@/forms/components/DrInput/composables/useDrInputEditor/types';

export type UseDrMaskedInputEditorParams = Pick<DrInputEditorParams, 'input' | 'readonly'> & {
  options: Readonly<Ref<FactoryOpts>>;
  masked: Readonly<Ref<FactoryReturnMasked<FactoryOpts>>>;
  inputValue: Readonly<Ref<string>>;
  accept: () => void;
};
