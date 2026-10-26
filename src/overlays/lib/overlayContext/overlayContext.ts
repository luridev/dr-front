import { computed, shallowRef } from 'vue';
import { defaultOverlayCloseOnBackdrop } from '@/overlays/config';
import { getDocumentModality } from '@/overlays/lib/documentModality/documentModality';
import type { DrOverlayLayer, OverlayContextSnapshot, OverlayHandle, OverlayOptions } from '@/overlays/types';

export function createOverlayContext() {
  const layers = shallowRef<ReadonlyArray<DrOverlayLayer>>([]);
  const modality = shallowRef<ReturnType<typeof getDocumentModality>>();
  const backgroundRoot = shallowRef<HTMLElement | null>(null);
  const disposed = shallowRef(false);
  const canOpenModal = computed(() => !disposed.value && backgroundRoot.value != null);
  let uid = 0;

  function open(options: OverlayOptions, context: OverlayContextSnapshot): OverlayHandle | undefined {
    if (disposed.value) {
      return undefined;
    }

    const root = backgroundRoot.value;

    if (root == null) {
      throw new Error('Opening a modal requires a mounted <DrModalHost> with a backgroundRoot.');
    }

    const token = Symbol();
    let closed = false;

    const handle: OverlayHandle = {
      close() {
        if (closed) {
          return;
        }

        closed = true;
        layers.value = layers.value.filter((layer) => layer.token !== token);
        modality.value?.release(token);
        options.onClose?.();
      },
    };

    uid += 1;

    layers.value = [...layers.value, {
      uid,
      token,
      context,
      content: options.content,
      closeOnBackdrop: options.closeOnBackdrop ?? defaultOverlayCloseOnBackdrop,
      close: handle.close,
    }];

    modality.value?.register(token, root, handle.close, options.opener);

    return handle;
  }

  function setBackgroundRoot(root: HTMLElement | null) {
    if (disposed.value || root === backgroundRoot.value) {
      return;
    }

    backgroundRoot.value = root;

    if (root == null) {
      for (const layer of [...layers.value].reverse()) {
        layer.close();
      }

      modality.value = undefined;

      return;
    }

    const nextModality = getDocumentModality(root.ownerDocument);

    if (modality.value !== nextModality) {
      for (const layer of layers.value) {
        modality.value?.release(layer.token, false);
      }
    }

    const previousModality = modality.value;

    modality.value = nextModality;

    for (const layer of layers.value) {
      if (previousModality === nextModality) {
        nextModality.updateBackground(layer.token, root);
      } else {
        nextModality.register(layer.token, root, layer.close);
      }
    }
  }

  function dispose() {
    disposed.value = true;

    for (const layer of [...layers.value].reverse()) {
      layer.close();
    }

    backgroundRoot.value = null;
    modality.value = undefined;
  }

  return {
    canOpenModal,
    layers: computed(() => layers.value),
    open,
    setBackgroundRoot,
    dispose,
    isTop: (token: symbol) => modality.value?.isTop(token) ?? false,
    order: (token: symbol) => modality.value?.order(token) ?? 0,
  };
}
