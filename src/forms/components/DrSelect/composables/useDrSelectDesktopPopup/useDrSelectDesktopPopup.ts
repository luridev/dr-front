import { onBeforeUnmount, onMounted, readonly, ref } from 'vue';
import type { UseDrSelectDesktopPopupParams } from '@/forms/components/DrSelect/composables/useDrSelectDesktopPopup/types';

export function useDrSelectDesktopPopup({ rootElement }: UseDrSelectDesktopPopupParams) {
  const isOpen = ref(false);

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function handleDocumentPointerdown(event: PointerEvent) {
    const target = event.target;

    if (isOpen.value && target instanceof Node && rootElement.value?.contains(target) !== true) {
      close();
    }
  }

  onMounted(() => {
    document.addEventListener('pointerdown', handleDocumentPointerdown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', handleDocumentPointerdown);
  });

  return {
    isOpen: readonly(isOpen),
    open,
    close,
  };
}
