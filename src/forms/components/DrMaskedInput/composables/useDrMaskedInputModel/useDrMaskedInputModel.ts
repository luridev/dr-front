import { onMounted, readonly, ref, watch } from 'vue';
import type { UseDrMaskedInputModelParams } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputModel/types';
import type { DrMaskValue } from '@/forms/components/DrMaskedInput/lib/maskCodec/types';
import type { DrMaskedInputStatus } from '@/forms/components/DrMaskedInput/types';

export function useDrMaskedInputModel({ model, codec, onStatusUpdate }: UseDrMaskedInputModelParams) {
  const inputValue = ref('');
  const invalidExternal = ref(false);
  const status = ref<DrMaskedInputStatus>('empty');
  let requestedValue = model.value;

  function apply(result: DrMaskValue) {
    inputValue.value = result.display;
    status.value = result.status;
    invalidExternal.value = result.status === 'invalid';
  }

  watch([model, codec], ([value, nextCodec], [previousValue, previousCodec]) => {
    if (previousValue !== undefined && nextCodec === previousCodec && value === requestedValue) {
      return;
    }

    requestedValue = value;
    apply(nextCodec.write(value));
  }, { immediate: true });

  onMounted(() => {
    onStatusUpdate(status.value);

    watch(status, (next) => {
      onStatusUpdate(next);
    });
  });

  function updateInputValue(display: string) {
    const result = codec.value.read(display);
    apply(result);

    if (requestedValue !== result.canonical) {
      requestedValue = result.canonical;
      model.value = result.canonical;
    }
  }

  return { inputValue: readonly(inputValue), invalidExternal: readonly(invalidExternal), updateInputValue };
}
