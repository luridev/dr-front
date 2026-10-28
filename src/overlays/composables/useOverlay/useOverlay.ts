import { computed, getCurrentInstance, inject } from 'vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { drToastKey } from '@/feedback/toasts/keys';
import { useOverlayLifecycle } from '@/overlays/composables/useOverlayLifecycle/useOverlayLifecycle';
import { drOverlayKey } from '@/overlays/keys';
import type { UseOverlay } from '@/overlays/composables/useOverlay/types';
import type { OverlayHandle, OverlayOptions } from '@/overlays/types';

export function useOverlay(): UseOverlay {
  const context = getCurrentInstance() == null ? undefined : inject(drOverlayKey, undefined);
  const toast = getCurrentInstance() == null ? undefined : inject(drToastKey, undefined);
  const config = useDrConfig();
  const ownedHandles = new Set<OverlayHandle>();

  const isActive = useOverlayLifecycle(() => {
    for (const handle of [...ownedHandles].reverse()) {
      handle.close(false);
    }
  });

  const canOpenModal = computed(() => isActive.value && context?.canOpenModal.value === true);
  const portalTarget = computed(() => context?.portalTarget.value ?? null);

  function open(options: OverlayOptions): OverlayHandle | undefined {
    if (!isActive.value) {
      return undefined;
    }

    if (context == null) {
      throw new Error('Opening a modal requires an ancestor <DrModalHost>.');
    }

    const handle = context.open({
      ...options,
      onClose() {
        if (handle != null) {
          ownedHandles.delete(handle);
        }

        options.onClose?.();
      },
    }, { toast, config });

    if (handle != null) {
      ownedHandles.add(handle);
    }

    return handle;
  }

  return {
    isActive,
    canOpenModal,
    portalTarget,
    isTop: (token) => context?.isTop(token) ?? false,
    order: (token) => context?.order(token) ?? 0,
    open,
  };
}
