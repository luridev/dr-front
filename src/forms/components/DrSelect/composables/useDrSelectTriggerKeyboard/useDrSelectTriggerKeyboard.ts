import type { UseDrSelectTriggerKeyboardParams } from '@/forms/components/DrSelect/composables/useDrSelectTriggerKeyboard/types';

export function useDrSelectTriggerKeyboard(params: UseDrSelectTriggerKeyboardParams) {
  const { popup, navigation } = params;

  function handleTriggerKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();

        if (popup.isOpen.value) {
          params.selectActiveItem();
        } else {
          params.openOptions();
        }

        return;

      case 'ArrowDown':
        event.preventDefault();

        if (popup.isOpen.value) {
          navigation.moveActiveItem(1);
        } else {
          params.openOptions('next');
        }

        return;

      case 'ArrowUp':
        event.preventDefault();

        if (popup.isOpen.value) {
          navigation.moveActiveItem(-1);
        } else {
          params.openOptions('previous');
        }

        return;

      case 'Home':
        event.preventDefault();

        if (popup.isOpen.value) {
          navigation.activateFirstItem();
        } else {
          params.openOptions('first');
        }

        return;

      case 'End':
        event.preventDefault();

        if (popup.isOpen.value) {
          navigation.activateLastItem();
        } else {
          params.openOptions('last');
        }

        return;

      case 'Tab':
        popup.close();
    }
  }

  return handleTriggerKeydown;
}
