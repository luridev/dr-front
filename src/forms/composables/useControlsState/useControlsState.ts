import { computed, readonly, ref } from 'vue';
import { mapObjectValues } from '@/forms/composables/useControlsState/lib/mapObjectValues/mapObjectValues';
import type {
  ControlStateDescriptor,
  ControlStateItem,
  ControlsState,
  ControlsStateDescriptors,
  ControlsStateRefs,
  UseControlsStateOptions,
  UseControlsStateResult,
} from '@/forms/composables/useControlsState/types';

export function useControlsState<const TControls extends ControlsStateDescriptors>(
  options: UseControlsStateOptions<TControls>,
): UseControlsStateResult<TControls> {
  const errorStatesVisible = ref(false);
  const isValid = computed(options.isValid);

  const controlRefs: ControlsStateRefs<TControls> = mapObjectValues(options.controls, (_, descriptor) =>
    computed<ControlStateItem>(() => resolveControlState(descriptor)),
  );

  const hasVisibleValidationErrors = computed(() => errorStatesVisible.value && !isValid.value);

  function resolveControlState(descriptor: ControlStateDescriptor): ControlStateItem {
    const commonDisabled = options.isDisabled?.() ?? false;
    const localDisabled = descriptor.disabled?.() ?? false;
    const disabled = commonDisabled || localDisabled;

    if (errorStatesVisible.value) {
      const errorPayload = descriptor.errorState?.();

      if (errorPayload != null) {
        return {
          ...errorPayload,
          disabled,
          state: 'error',
        };
      }
    }

    const normalPayload = descriptor.normalState?.();

    if (normalPayload != null) {
      return {
        ...normalPayload,
        disabled,
        state: 'normal',
      };
    }

    return {
      disabled,
      state: 'normal',
    };
  }

  function showValidationErrors(): void {
    errorStatesVisible.value = true;
  }

  function resetControlsState(): void {
    errorStatesVisible.value = false;
  }

  return {
    controls: readonly(controlRefs) as ControlsState<TControls>,
    showValidationErrors,
    resetControlsState,
    hasVisibleValidationErrors,
  };
}
