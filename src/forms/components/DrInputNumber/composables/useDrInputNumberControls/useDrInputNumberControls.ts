import { computed, toValue } from 'vue';
import { normalizeNegativeZero } from '@/numbers/lib/normalizeNegativeZero/normalizeNegativeZero';
import type {
  DrInputNumberStepDirection,
  UseDrInputNumberControlsParams,
} from '@/forms/components/DrInputNumber/composables/useDrInputNumberControls/types';

function isSafeArithmeticValue(value: unknown): value is number {
  return Number.isSafeInteger(value);
}

export function useDrInputNumberControls({
  model,
  min: minSource,
  max: maxSource,
  step: stepSource,
  disabled: disabledSource,
}: UseDrInputNumberControlsParams) {
  const min = computed(() => toValue(minSource));
  const max = computed(() => toValue(maxSource));
  const step = computed(() => toValue(stepSource));
  const effectiveMin = computed(() => min.value ?? Number.MIN_SAFE_INTEGER);
  const effectiveMax = computed(() => max.value ?? Number.MAX_SAFE_INTEGER);

  const isBoundsValid = computed(() => {
    const minValue = effectiveMin.value;
    const maxValue = effectiveMax.value;

    return isSafeArithmeticValue(minValue) && isSafeArithmeticValue(maxValue) && minValue <= maxValue;
  });

  const isStepValid = computed(() => isSafeArithmeticValue(step.value) && step.value > 0);
  const isConfigurationValid = computed(() => isBoundsValid.value && isStepValid.value);
  const isControlsEnabled = computed(() => isConfigurationValid.value && !toValue(disabledSource));

  const allowsNegative = computed(() => isBoundsValid.value && effectiveMin.value < 0);
  const allowsPositive = computed(() => isBoundsValid.value && effectiveMax.value > 0);

  function clampCandidate(value: number) {
    return Math.min(effectiveMax.value, Math.max(effectiveMin.value, value));
  }

  function getNullNextValue(direction: DrInputNumberStepDirection) {
    if (direction === 'increment') {
      if (!allowsPositive.value) {
        return null;
      }

      return clampCandidate(effectiveMin.value > 0 ? effectiveMin.value : step.value);
    }

    if (!allowsNegative.value) {
      return null;
    }

    return clampCandidate(effectiveMax.value < 0 ? effectiveMax.value : -step.value);
  }

  function getNextValue(direction: DrInputNumberStepDirection) {
    if (!isControlsEnabled.value) {
      return null;
    }

    const value = model.value;

    if (value == null) {
      return getNullNextValue(direction);
    }

    if (!isSafeArithmeticValue(value)) {
      return null;
    }

    if (value < effectiveMin.value) {
      return direction === 'increment' ? effectiveMin.value : null;
    }

    if (value > effectiveMax.value) {
      return direction === 'decrement' ? effectiveMax.value : null;
    }

    if (direction === 'increment' && value >= effectiveMax.value) {
      return null;
    }

    if (direction === 'decrement' && value <= effectiveMin.value) {
      return null;
    }

    const candidate =
      direction === 'increment'
        ? value > effectiveMax.value - step.value
          ? effectiveMax.value
          : value + step.value
        : value < effectiveMin.value + step.value
          ? effectiveMin.value
          : value - step.value;

    return isSafeArithmeticValue(candidate) ? normalizeNegativeZero(clampCandidate(candidate)) : null;
  }

  function canChangeValue(direction: DrInputNumberStepDirection) {
    const nextValue = getNextValue(direction);

    return nextValue != null && !Object.is(model.value, nextValue);
  }

  const canIncrement = computed(() => canChangeValue('increment'));
  const canDecrement = computed(() => canChangeValue('decrement'));

  function changeValue(direction: DrInputNumberStepDirection) {
    const nextValue = getNextValue(direction);

    if (nextValue == null || Object.is(model.value, nextValue)) {
      return false;
    }

    model.value = nextValue;

    return true;
  }

  return {
    min,
    max,
    allowsNegative,
    isBoundsValid,
    canIncrement,
    canDecrement,
    increment: () => changeValue('increment'),
    decrement: () => changeValue('decrement'),
  };
}
