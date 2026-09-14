import { computed, toValue } from 'vue';
import { integerInputMinusSign } from '@/forms/lib/inputFormats/integer/config';
import { isFiniteNumber } from '@/numbers/lib/isFiniteNumber/isFiniteNumber';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type { DrInputAria } from '@/forms/components/DrInput/types';
import type { UseDrInputNumberAriaParams } from '@/forms/components/DrInputNumber/composables/useDrInputNumberAria/types';

export function useDrInputNumberAria({
  model,
  inputValue,
  min,
  max,
  isBoundsValid,
  label,
}: UseDrInputNumberAriaParams) {
  const fieldNameSuffix = computed(() => {
    const value = toValue(label);

    return isNonBlankString(value) ? ` поля «${value.trim()}»` : '';
  });

  function getIncompleteValueText(value: string) {
    return value === integerInputMinusSign ? 'Ввод отрицательного числа не завершён' : 'Значение не задано';
  }

  const inputAria = computed<DrInputAria>(() => {
    const value = model.value;
    const boundsValid = toValue(isBoundsValid);
    const isValueValid = isFiniteNumber(value);

    return {
      ariaValueMin: boundsValid ? toValue(min) : undefined,
      ariaValueMax: boundsValid ? toValue(max) : undefined,
      ariaValueNow: isValueValid ? value : undefined,
      ariaValueText: isValueValid ? undefined : getIncompleteValueText(inputValue.value),
    };
  });

  const incrementAriaLabel = computed(() => `Увеличить значение${fieldNameSuffix.value}`);
  const decrementAriaLabel = computed(() => `Уменьшить значение${fieldNameSuffix.value}`);
  const signAriaLabel = computed(() => `Изменить знак${fieldNameSuffix.value}`);

  return {
    inputAria,
    incrementAriaLabel,
    decrementAriaLabel,
    signAriaLabel,
  };
}
