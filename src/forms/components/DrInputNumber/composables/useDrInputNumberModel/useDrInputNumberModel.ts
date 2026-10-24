import { computed, onMounted, readonly, ref, toValue, watch } from 'vue';
import { integerInputMinusSign } from '@/forms/lib/inputFormats/integer/config';
import {
  parseIntegerInputValue,
  stringifyIntegerInputValue,
} from '@/forms/lib/inputFormats/integer/integerInputFormat';
import { isFiniteNumber } from '@/numbers/lib/isFiniteNumber/isFiniteNumber';
import type { UseDrInputNumberModelParams } from '@/forms/components/DrInputNumber/composables/useDrInputNumberModel/types';

function isPendingNegativeInput(value: string) {
  return value === integerInputMinusSign;
}

export function useDrInputNumberModel({ model, thousandSeparator, onStatusUpdate }: UseDrInputNumberModelParams) {
  const separator = computed(() => toValue(thousandSeparator));
  const inputValue = ref(stringifyIntegerInputValue(model.value, separator.value));
  const parsedInput = computed(() => parseIntegerInputValue(inputValue.value, separator.value));
  const status = computed(() => parsedInput.value.status);

  const canToggleSign = computed(() => {
    const value = model.value;

    if (value == null) {
      return inputValue.value === '' || isPendingNegativeInput(inputValue.value);
    }

    return isFiniteNumber(value) && value !== 0;
  });

  watch([model, separator], ([value, group], [, previousGroup]) => {
    const result = parseIntegerInputValue(inputValue.value, previousGroup);
    const currentInputModelValue = result.status === 'valid' ? result.value : null;

    if (Object.is(currentInputModelValue, value)) {
      inputValue.value = inputValue.value.replaceAll(previousGroup, group);

      return;
    }

    inputValue.value = stringifyIntegerInputValue(value, group);
  });

  onMounted(() => {
    onStatusUpdate(status.value);
    watch(status, onStatusUpdate);
  });

  function updateInputValue(value: string) {
    inputValue.value = value;

    const result = parsedInput.value;
    const nextModelValue = result.status === 'valid' ? result.value : null;

    if (Object.is(model.value, nextModelValue)) {
      return;
    }

    model.value = nextModelValue;
  }

  function toggleSign() {
    if (!canToggleSign.value) {
      return false;
    }

    const value = model.value;

    if (value == null) {
      inputValue.value = isPendingNegativeInput(inputValue.value) ? '' : integerInputMinusSign;
    } else {
      model.value = -value;
    }

    return true;
  }

  function canonicalizeInputValue() {
    if (!isPendingNegativeInput(inputValue.value)) {
      return false;
    }

    inputValue.value = '';

    return true;
  }

  return {
    inputValue: readonly(inputValue),
    status,
    canToggleSign,
    updateInputValue,
    toggleSign,
    canonicalizeInputValue,
  };
}
