import { nextTick, onScopeDispose } from 'vue';
import { defaultOverlayCloseOnBackdrop } from '@/overlays/config';
import { addOverlayLayer, overlayLayers, removeOverlayLayer } from '@/overlays/lib/overlayState/overlayState';
import type { UseOverlay } from '@/overlays/composables/useOverlay/types';
import type { OverlayHandle, OverlayOptions } from '@/overlays/types';

let nextOverlayUid = 1;

export function useOverlay(): UseOverlay {
  const ownedHandles = new Set<OverlayHandle>();

  function getTopOverlayUid(): number | undefined {
    return overlayLayers.value[overlayLayers.value.length - 1]?.uid;
  }

  function restoreFocus(element: HTMLElement | undefined, expectedTopUid: number | undefined) {
    void nextTick(() => {
      if (getTopOverlayUid() === expectedTopUid && element?.isConnected === true) {
        element.focus();
      }
    });
  }

  function open(options: OverlayOptions): OverlayHandle {
    const uid = nextOverlayUid;

    const restoreFocusTo =
      typeof document === 'undefined' || !(document.activeElement instanceof HTMLElement)
        ? undefined
        : document.activeElement;

    nextOverlayUid += 1;

    let isClosed = false;

    const handle: OverlayHandle = {
      close() {
        if (isClosed) {
          return;
        }

        isClosed = true;

        const shouldRestoreFocus = getTopOverlayUid() === uid;

        ownedHandles.delete(handle);
        removeOverlayLayer(uid);

        const expectedTopUid = getTopOverlayUid();

        if (shouldRestoreFocus) {
          restoreFocus(restoreFocusTo, expectedTopUid);
        }

        options.onClose?.();
      },
    };

    ownedHandles.add(handle);

    addOverlayLayer({
      uid,
      content: options.content,
      closeOnBackdrop: options.closeOnBackdrop ?? defaultOverlayCloseOnBackdrop,
      close: handle.close,
    });

    return handle;
  }

  onScopeDispose(() => {
    for (const handle of Array.from(ownedHandles).reverse()) {
      handle.close();
    }
  });

  return {
    open,
  };
}
