import { computed, toValue } from 'vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type { DrInputAria } from '@/forms/components/DrInput/types';
import type { UseDrInputNumberAriaParams } from '@/forms/components/DrInputNumber/composables/useDrInputNumberAria/types';

export function useDrInputNumberAria({
  model,
  inputValue,
  status,
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

  function getDraftValueText() {
    switch (toValue(status)) {
      case 'empty':
        return t('inputNumber.empty');
      case 'incomplete':
        return t('inputNumber.incompleteNegative');
      case 'invalid':
      case 'out-of-range':
      case 'valid':
        return inputValue.value;
    }
  }

  const inputAria = computed<DrInputAria>(() => {
    const value = model.value;
    const boundsValid = toValue(isBoundsValid);
    const isValueValid = toValue(status) === 'valid' && Number.isSafeInteger(value);
    const minValue = toValue(min);
    const maxValue = toValue(max);

    const isOutOfBounds = isValueValid && value !== null && boundsValid && (
      (minValue != null && value < minValue) || (maxValue != null && value > maxValue)
    );

    return {
      ariaInvalid: isOutOfBounds || undefined,
      ariaValueMin: boundsValid ? minValue : undefined,
      ariaValueMax: boundsValid ? maxValue : undefined,
      ariaValueNow: isValueValid && value !== null ? value : undefined,
      ariaValueText: isValueValid ? undefined : getDraftValueText(),
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
