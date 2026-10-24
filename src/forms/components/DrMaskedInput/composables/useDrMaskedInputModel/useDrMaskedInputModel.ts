import { createMask } from 'imask';
import { computed, onMounted, ref, shallowRef, triggerRef, watch } from 'vue';
import type { UseDrMaskedInputModelParams } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputModel/types';
import type { DrMaskedInputStatus } from '@/forms/components/DrMaskedInput/types';

export function useDrMaskedInputModel({ model, mask, onStatusUpdate }: UseDrMaskedInputModelParams) {
  const options = computed(() => typeof mask.value === 'string' ? { mask: mask.value } : mask.value);
  const masked = shallowRef(createMask(options.value));
  const inputValue = ref('');
  const status = ref<DrMaskedInputStatus>('empty');
  let requestedValue = model.value;
  let mounted = false;

  function accept() {
    const engine = masked.value;
    inputValue.value = engine.displayValue;
    status.value = engine.rawInputValue === '' ? 'empty' : engine.isComplete ? 'valid' : 'incomplete';

    if (mounted && requestedValue !== engine.unmaskedValue) {
      requestedValue = engine.unmaskedValue;
      model.value = requestedValue;
    }
  }

  watch([model, options], ([value, nextOptions], [, previousOptions]) => {
    if (nextOptions === previousOptions && value === requestedValue) {
      return;
    }

    requestedValue = value;

    if (previousOptions !== undefined && nextOptions !== previousOptions) {
      masked.value = createMask(nextOptions);
    }

    masked.value.unmaskedValue = value;
    accept();
    triggerRef(masked);
  }, { immediate: true });

  onMounted(() => {
    mounted = true;
    accept();
    onStatusUpdate(status.value);

    watch(status, (next) => {
      onStatusUpdate(next);
    });
  });

  function updateInputValue(value: string) {
    masked.value.reset();
    masked.value.unmaskedValue = value;
    accept();
    triggerRef(masked);
  }

  return { options, masked, inputValue, accept, updateInputValue };
}
