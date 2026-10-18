import { inject, provide, watch } from 'vue';
import { drInputEditorKey } from '@/forms/components/DrInput/composables/useDrInputEditor/config';
import type {
  DrInputEditor,
  DrInputEditorFactory,
  DrInputEditorParams,
} from '@/forms/components/DrInput/composables/useDrInputEditor/types';

export function provideDrInputEditor(factory: DrInputEditorFactory) {
  provide(drInputEditorKey, factory);
}

export function useDrInputEditor({ input, model, readonly }: DrInputEditorParams): DrInputEditor {
  const factory = inject(drInputEditorKey, undefined);

  provide(drInputEditorKey, undefined);

  if (factory !== undefined) {
    return factory({ input, model, readonly });
  }

  watch([input, model], () => {
    if (input.value !== null && input.value.value !== model.value) {
      input.value.value = model.value;
    }
  }, { flush: 'post' });

  function handleInput() {
    if (input.value !== null && !readonly()) {
      model.value = input.value.value;
    }
  }

  return { handleInput };
}
