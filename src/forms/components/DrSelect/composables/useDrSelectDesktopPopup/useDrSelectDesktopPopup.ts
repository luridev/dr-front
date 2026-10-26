import { autoUpdate, flip, hide, offset, shift, size, useFloating } from '@floating-ui/vue';
import { computed, inject, onScopeDispose, readonly, ref, watch } from 'vue';
import { floatingGap, viewportPadding } from '@/forms/components/DrSelect/composables/useDrSelectDesktopPopup/config';
import { getDocumentModality } from '@/overlays/lib/documentModality/documentModality';
import { floatingScopeKey } from '@/overlays/lib/floatingScope/floatingScope';
import type { UseDrSelectDesktopPopupParams } from '@/forms/components/DrSelect/composables/useDrSelectDesktopPopup/types';

export function useDrSelectDesktopPopup({ rootElement, popupElement, reference }: UseDrSelectDesktopPopupParams) {
  const isOpen = ref(false);
  const owner = inject(floatingScopeKey, undefined);
  const portalTarget = computed(() => owner?.target.value ?? rootElement.value?.ownerDocument.body);

  const ownerActive = computed(() => owner?.active.value ??
    (rootElement.value == null || !getDocumentModality(rootElement.value.ownerDocument).hasModal.value));

  function close() {
    isOpen.value = false;
  }

  function open() {
    if (ownerActive.value) {
      isOpen.value = true;
    }
  }

  function contains(target: Node | null) {
    return rootElement.value?.contains(target) === true || popupElement.value?.contains(target) === true;
  }

  function handleDocumentPointerdown(event: PointerEvent) {
    if (event.target instanceof Node && !contains(event.target)) {
      close();
    }
  }

  watch(ownerActive, (active) => {
    if (!active) {
      close();
    }
  });

  watch(isOpen, (active, _, cleanup) => {
    const document = rootElement.value?.ownerDocument;

    if (active && document != null) {
      document.addEventListener('pointerdown', handleDocumentPointerdown);

      cleanup(() => {
        document.removeEventListener('pointerdown', handleDocumentPointerdown);
      });
    }
  }, { flush: 'sync' });

  const overflow = { padding: viewportPadding, boundary: [], rootBoundary: 'viewport' as const };

  const { floatingStyles, isPositioned, middlewareData } = useFloating(reference, popupElement, {
    open: isOpen,
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(floatingGap),
      flip({ ...overflow, crossAxis: false, flipAlignment: false }),
      shift({ ...overflow, crossAxis: false }),
      size({
        ...overflow,
        apply({ availableWidth, availableHeight, rects, elements }) {
          const width = Math.max(0, availableWidth);
          elements.floating.style.maxWidth = `min(40rem, ${width}px)`;
          elements.floating.style.minWidth = `${Math.min(rects.reference.width, width)}px`;
          elements.floating.style.setProperty('--dr-select-available-height', `${Math.max(0, availableHeight)}px`);
        },
      }),
      hide(),
    ],
    whileElementsMounted: autoUpdate,
  });

  watch(() => middlewareData.value.hide?.referenceHidden, (hidden) => {
    if (hidden === true) {
      close();
    }
  });

  onScopeDispose(close);

  return { isOpen: readonly(isOpen), ownerActive, portalTarget, floatingStyles, isPositioned, open, close };
}
