import { computed, readonly, ref, watch } from 'vue';
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

export function useDrInputNumberModel({ model }: UseDrInputNumberModelParams) {
  const inputValue = ref(stringifyIntegerInputValue(model.value));

  const canToggleSign = computed(() => {
    const value = model.value;

    if (value == null) {
      return inputValue.value === '' || isPendingNegativeInput(inputValue.value);
    }

    return isFiniteNumber(value) && value !== 0;
  });

  watch(model, (value) => {
    const currentInputModelValue = parseIntegerInputValue(inputValue.value);

    if (Object.is(currentInputModelValue, value)) {
      return;
    }

    inputValue.value = stringifyIntegerInputValue(value);
  });

  function updateInputValue(value: string) {
    inputValue.value = value;

    const nextModelValue = parseIntegerInputValue(value);

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
    canToggleSign,
    updateInputValue,
    toggleSign,
    canonicalizeInputValue,
  };
}
