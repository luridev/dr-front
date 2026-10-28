import IMask from 'imask';
import { onBeforeUnmount, watch } from 'vue';
import type { FactoryOpts, InputMask } from 'imask';
import type { UseDrMaskedInputEditorParams } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputEditor/types';

export function useDrMaskedInputEditor({
  input, inputValue, readonly, masked, accept,
}: UseDrMaskedInputEditorParams) {
  let control: InputMask<FactoryOpts> | undefined;
  let selection: Pick<HTMLInputElement, 'selectionStart' | 'selectionEnd' | 'selectionDirection'> | undefined;

  watch([masked, readonly], () => {
    const element = input.value;

    selection = element === null
      ? undefined
      : {
          selectionStart: element.selectionStart,
          selectionEnd: element.selectionEnd,
          selectionDirection: element.selectionDirection,
        };
  });

  watch([input, masked, readonly], (_, previous) => {
    const element = input.value;

    if (element !== previous[0] || control?.masked !== masked.value || readonly()) {
      control?.destroy();
      control = undefined;
    }

    if (element === null) {
      return;
    }

    let created = false;

    if (!readonly() && control === undefined) {
      control = IMask(element, { mask: /.*/ });
      control.masked = masked.value;
      control.history.clear();
      created = true;
    }

    if (element.value !== inputValue.value) {
      element.value = inputValue.value;
    }

    if (selection?.selectionStart != null) {
      element.setSelectionRange(
        Math.min(selection.selectionStart, element.value.length),
        Math.min(selection.selectionEnd ?? selection.selectionStart, element.value.length),
        selection.selectionDirection ?? undefined,
      );
    }

    selection = undefined;
    control?.updateControl();

    if (created) {
      control?.on('accept', accept);
    }
  }, { flush: 'post' });

  watch(inputValue, () => {
    if (control?.masked === masked.value) {
      control.updateControl();
    }
  }, { flush: 'sync' });

  onBeforeUnmount(() => control?.destroy());

  return {
    inputMode: 'text' as const,
    getInputValue: () => input.value?.value ?? inputValue.value,
  };
}
