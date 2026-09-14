import { readonly, ref, useId } from 'vue';
import DrDialogOverlayContent from '@/dialogs/components/DrDialogOverlayContent/DrDialogOverlayContent.vue';
import { useComponent } from '@/dynamic-components/composables/useComponent/useComponent';
import { useOverlay } from '@/overlays/composables/useOverlay/useOverlay';
import type { DialogEventHandlers, UseDialog, UseDialogOptions } from '@/dialogs/types';
import type { DrComponentEventHandler } from '@/dynamic-components/types';
import type { OverlayHandle } from '@/overlays/types';

function isDrComponentEventHandler(value: unknown): value is DrComponentEventHandler {
  return typeof value === 'function';
}

export function useDialog<TProps extends object = Record<never, never>, TEvents extends object = Record<never, never>>(
  options: UseDialogOptions<TProps>,
): UseDialog<TEvents> {
  const overlay = useOverlay();
  const id = useId();
  const isOpen = ref(false);

  let currentOverlayHandle: OverlayHandle | undefined;

  function close() {
    currentOverlayHandle?.close();
  }

  function open(handlers?: DialogEventHandlers<TEvents>) {
    if (currentOverlayHandle != null) {
      return;
    }

    let isCompleting = false;

    function closeOpenedDialog() {
      openedOverlayHandle.close();
    }

    const completionEvents: Record<string, DrComponentEventHandler> = {};

    for (const [eventName, eventHandler] of Object.entries(handlers ?? {})) {
      if (!isDrComponentEventHandler(eventHandler)) {
        continue;
      }

      completionEvents[eventName] = async (...args: Array<never>) => {
        if (isCompleting) {
          return;
        }

        isCompleting = true;

        try {
          await eventHandler(...args);
          closeOpenedDialog();
        } finally {
          isCompleting = false;
        }
      };
    }

    const content = useComponent({
      component: options.component,
      props: options.props,
      events: completionEvents,
      slots: options.slots,
    });

    const dialogContent = useComponent({
      component: DrDialogOverlayContent,
      props: {
        id,
        title: options.title,
        content,
        footer: options.footer,
        close: closeOpenedDialog,
      },
    });

    const openedOverlayHandle: OverlayHandle = overlay.open({
      content: dialogContent,
      closeOnBackdrop: options.closeOnBackdrop,
      onClose: () => {
        if (currentOverlayHandle !== openedOverlayHandle) {
          return;
        }

        currentOverlayHandle = undefined;
        isOpen.value = false;
      },
    });

    currentOverlayHandle = openedOverlayHandle;
    isOpen.value = true;
  }

  return {
    id,
    isOpen: readonly(isOpen),
    open,
    close,
  };
}
