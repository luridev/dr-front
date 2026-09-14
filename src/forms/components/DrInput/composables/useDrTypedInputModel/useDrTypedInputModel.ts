import { nextTick, onMounted, readonly, ref, toValue, watch } from 'vue';
import type {
  DrTypedInputStatus,
  UseDrTypedInputModelParams,
  UseDrTypedInputModelResult,
} from '@/forms/components/DrInput/composables/useDrTypedInputModel/types';

export function useDrTypedInputModel<TValue, TAdditionalStatus extends string = never, TFormatDependency = unknown>({
  model,
  formatSource,
  parse,
  stringify,
  equals,
  onStatusUpdate,
}: UseDrTypedInputModelParams<TValue, TAdditionalStatus, TFormatDependency>): UseDrTypedInputModelResult {
  const inputValue = ref('');

  let pendingInputModelValue: TValue | null = null;
  let hasPendingInputModelValue = false;
  let pendingCleanupVersion = 0;
  let observedFormatDependency: TFormatDependency | undefined;
  let hasObservedFormatDependency = false;
  let currentStatus: DrTypedInputStatus | TAdditionalStatus = 'empty';
  let lastEmittedStatus: DrTypedInputStatus | TAdditionalStatus | undefined;
  let isMounted = false;

  function areModelValuesEqual(first: TValue | null, second: TValue | null) {
    if (first == null || second == null) {
      return first === second;
    }

    return equals(first, second);
  }

  function emitStatus(status: DrTypedInputStatus | TAdditionalStatus) {
    if (lastEmittedStatus === status) {
      return;
    }

    lastEmittedStatus = status;
    onStatusUpdate(status);
  }

  function setStatus(status: DrTypedInputStatus | TAdditionalStatus) {
    currentStatus = status;

    if (isMounted) {
      emitStatus(status);
    }
  }

  function syncInputWithModel(value: TValue | null) {
    inputValue.value = stringify(value);
    setStatus(value == null ? 'empty' : 'valid');
  }

  function updateModelFromInput(value: TValue | null) {
    const currentRequestedValue = hasPendingInputModelValue ? pendingInputModelValue : model.value;

    if (areModelValuesEqual(currentRequestedValue, value)) {
      return;
    }

    pendingInputModelValue = value;
    hasPendingInputModelValue = true;
    pendingCleanupVersion += 1;
    const cleanupVersion = pendingCleanupVersion;

    model.value = value;

    void nextTick(() => {
      if (cleanupVersion === pendingCleanupVersion) {
        hasPendingInputModelValue = false;
      }
    });
  }

  function updateInputValue(value: string) {
    inputValue.value = value;

    const result = parse(value);

    updateModelFromInput('value' in result ? result.value : null);
    setStatus(result.status);
  }

  watch(
    () => [model.value, formatSource == null ? undefined : toValue(formatSource)] as const,
    ([value, nextFormatDependency]) => {
      const formatChanged = hasObservedFormatDependency && !Object.is(observedFormatDependency, nextFormatDependency);

      observedFormatDependency = nextFormatDependency;
      hasObservedFormatDependency = true;

      if (formatChanged) {
        hasPendingInputModelValue = false;
        syncInputWithModel(value);

        return;
      }

      if (hasPendingInputModelValue && areModelValuesEqual(pendingInputModelValue, value)) {
        hasPendingInputModelValue = false;

        return;
      }

      hasPendingInputModelValue = false;
      syncInputWithModel(value);
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    isMounted = true;
    emitStatus(currentStatus);
  });

  return {
    inputValue: readonly(inputValue),
    updateInputValue,
  };
}
