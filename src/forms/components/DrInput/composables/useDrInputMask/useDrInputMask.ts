import IMask from 'imask/holder';
import { computed, onBeforeUnmount, unref, watch } from 'vue';
import { provideDrInputEditor } from '@/forms/components/DrInput/composables/useDrInputEditor/useDrInputEditor';
import type InputMask from 'imask/controls/input';
import type { FactoryOpts } from 'imask/masked/factory';
import type { DrInputMaskSource, UseDrInputMaskParams } from '@/forms/components/DrInput/composables/useDrInputMask/types';

export function provideDrInputMask(source: DrInputMaskSource) {
  provideDrInputEditor((params) => useDrInputMask({
    ...params,
    settings: computed(() => unref(source)),
  }));
}

export function useDrInputMask({ input, model, settings, readonly }: UseDrInputMaskParams) {
  let mask: InputMask<FactoryOpts> | undefined;
  let synchronizing = false;

  function accept() {
    if (!synchronizing && !readonly() && input.value !== null) {
      model.value = input.value.value;
    }
  }

  function write() {
    const element = input.value;

    if (element === null) {
      return;
    }

    synchronizing = true;

    if (mask === undefined) {
      element.value = settings.value.format?.(model.value) ?? model.value;
    } else {
      mask.value = model.value;
    }

    synchronizing = false;
  }

  watch([input, settings, readonly], () => {
    const element = input.value;
    const selection = element?.selectionStart;
    mask?.destroy();
    mask = undefined;

    if (element !== null) {
      element.value = model.value;

      if (!readonly() && settings.value.maskOptions !== null) {
        mask = IMask(element, settings.value.maskOptions);
        mask.on('accept', accept);
      }

      write();

      if (selection != null) {
        element.setSelectionRange(Math.min(selection, element.value.length), Math.min(selection, element.value.length));
      }
    }
  }, { flush: 'post' });

  watch(model, write, { flush: 'post' });

  function handleInput(event?: InputEvent) {
    const element = input.value;

    if (element === null || mask !== undefined || readonly() || event?.isComposing === true) {
      return;
    }

    accept();
  }

  onBeforeUnmount(() => mask?.destroy());

  return { handleInput, inputMode: computed(() => settings.value.inputMode) };
}
