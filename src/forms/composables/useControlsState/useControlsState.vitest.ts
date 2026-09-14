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
    'возвращает $expected при общем disabled=$commonDisabled и локальном disabled=$localDisabled',
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

  it('обновляет disabled при изменении isDisabled', () => {
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

  it('реактивно обновляет локальный disabled независимо для каждого control', () => {
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

  it('возвращает normal state без payload и реактивные normal messages', () => {
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

  it('показывает error payload вместо normal и сбрасывает только видимость validation', () => {
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

  it('сохраняет disabled при error без messages и возвращается к normal при исчезновении ошибки', () => {
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
