import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useControlsState } from '@/forms/composables/useControlsState/useControlsState';

describe('useControlsState', () => {
  it.each([
    { commonDisabled: false, localDisabled: false, expected: false },
    { commonDisabled: true, localDisabled: false, expected: true },
    { commonDisabled: false, localDisabled: true, expected: true },
    { commonDisabled: true, localDisabled: true, expected: true },
  ])(
    'returns $expected with shared disabled=$commonDisabled and local disabled=$localDisabled',
    ({ commonDisabled, localDisabled, expected }) => {
      const commonDisabledState = ref(commonDisabled);
      const localDisabledState = ref(localDisabled);

      const { controls } = useControlsState({
        isDisabled: () => commonDisabledState.value,
        isValid: () => true,
        controls: {
          control: {
            disabled: () => localDisabledState.value,
          },
        },
      });

      expect(controls.control.disabled).toBe(expected);
    },
  );

  it('updates disabled when isDisabled changes', () => {
    const commonDisabledState = ref(false);

    const { controls } = useControlsState({
      isDisabled: () => commonDisabledState.value,
      isValid: () => true,
      controls: {
        control: {},
      },
    });

    expect(controls.control.disabled).toBe(false);

    commonDisabledState.value = true;

    expect(controls.control.disabled).toBe(true);

    commonDisabledState.value = false;

    expect(controls.control.disabled).toBe(false);
  });

  it('reactively updates local disabled state independently for each control', () => {
    const disabled = ref(false);

    const { controls } = useControlsState({
      isValid: () => true,
      controls: {
        field: { disabled: () => disabled.value },
        other: {},
      },
    });

    expect(controls.field.disabled).toBe(false);

    disabled.value = true;

    expect(controls.field.disabled).toBe(true);
    expect(controls.other.disabled).toBe(false);

    disabled.value = false;

    expect(controls.field.disabled).toBe(false);
  });

  it('returns normal state without a payload and reactive normal messages', () => {
    const message = ref('first');

    const { controls, showValidationErrors } = useControlsState({
      isValid: () => true,
      controls: {
        plain: {},
        optional: { normalState: () => undefined, errorState: () => undefined },
        described: { normalState: () => ({ messages: [message.value] }) },
      },
    });

    expect(controls).toEqual({
      plain: { disabled: false, state: 'normal' },
      optional: { disabled: false, state: 'normal' },
      described: { disabled: false, state: 'normal', messages: ['first'] },
    });

    message.value = 'next';
    showValidationErrors();

    expect(controls.described.messages).toEqual(['next']);
    expect(controls.plain.state).toBe('normal');
    expect(controls.optional.state).toBe('normal');
  });

  it('shows the error payload instead of the normal payload and resets only validation visibility', () => {
    const isValid = ref(false);
    const errorMessage = ref('invalid');

    const { controls, showValidationErrors, resetControlsState, hasVisibleValidationErrors } = useControlsState({
      isValid: () => isValid.value,
      controls: {
        field: {
          normalState: () => ({ messages: ['hint'] }),
          errorState: () => ({ messages: [errorMessage.value] }),
        },
      },
    });

    expect(controls.field).toEqual({ disabled: false, state: 'normal', messages: ['hint'] });
    expect(hasVisibleValidationErrors.value).toBe(false);

    showValidationErrors();

    expect(controls.field).toEqual({ disabled: false, state: 'error', messages: ['invalid'] });
    expect(hasVisibleValidationErrors.value).toBe(true);

    errorMessage.value = 'updated';
    isValid.value = true;

    expect(controls.field).toEqual({ disabled: false, state: 'error', messages: ['updated'] });
    expect(hasVisibleValidationErrors.value).toBe(false);

    isValid.value = false;
    resetControlsState();

    expect(controls.field).toEqual({ disabled: false, state: 'normal', messages: ['hint'] });
    expect(hasVisibleValidationErrors.value).toBe(false);

    showValidationErrors();

    expect(controls.field.messages).toEqual(['updated']);
    expect(hasVisibleValidationErrors.value).toBe(true);
  });

  it('preserves disabled for errors without messages and returns to normal when the error clears', () => {
    const invalid = ref(true);

    const { controls, showValidationErrors, hasVisibleValidationErrors } = useControlsState({
      isDisabled: () => true,
      isValid: () => !invalid.value,
      controls: {
        field: { errorState: () => (invalid.value ? {} : undefined) },
      },
    });

    showValidationErrors();

    expect(controls.field).toEqual({ disabled: true, state: 'error' });
    expect(hasVisibleValidationErrors.value).toBe(true);

    invalid.value = false;

    expect(controls.field).toEqual({ disabled: true, state: 'normal' });
    expect(hasVisibleValidationErrors.value).toBe(false);
  });
});
