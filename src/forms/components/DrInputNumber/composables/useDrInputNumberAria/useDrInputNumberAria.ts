import { computed, toValue } from 'vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
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
  const t = useDrTranslation();

  const fieldName = computed(() => {
    const value = toValue(label);

    return isNonBlankString(value) ? value.trim() : undefined;
  });

  function getIncompleteValueText(value: string) {
    return value === integerInputMinusSign ? t('inputNumber.incompleteNegative') : t('inputNumber.empty');
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

  const incrementAriaLabel = computed(() => fieldName.value == null
    ? t('inputNumber.increment')
    : t('inputNumber.incrementNamed', { label: fieldName.value }));

  const decrementAriaLabel = computed(() => fieldName.value == null
    ? t('inputNumber.decrement')
    : t('inputNumber.decrementNamed', { label: fieldName.value }));

  const signAriaLabel = computed(() => fieldName.value == null
    ? t('inputNumber.sign')
    : t('inputNumber.signNamed', { label: fieldName.value }));

  return {
    inputAria,
    incrementAriaLabel,
    decrementAriaLabel,
    signAriaLabel,
  };
}
