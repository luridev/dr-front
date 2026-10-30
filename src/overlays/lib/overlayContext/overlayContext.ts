import { computed, shallowRef } from 'vue';
import { defaultOverlayCloseOnBackdrop } from '@/overlays/config';
import { getDocumentModality } from '@/overlays/lib/documentModality/documentModality';
import type { DrOverlayLayer, OverlayContextSnapshot, OverlayHandle, OverlayOptions } from '@/overlays/types';

export function createOverlayContext() {
  const layers = shallowRef<ReadonlyArray<DrOverlayLayer>>([]);
  const modality = shallowRef<ReturnType<typeof getDocumentModality>>();
  const backgroundRoot = shallowRef<HTMLElement | null>(null);
  const portalTarget = shallowRef<HTMLElement | null>(null);
  const availableBackgroundRoot = shallowRef<HTMLElement | null>(null);
  const disposed = shallowRef(false);
  const canOpenModal = computed(() => !disposed.value && availableBackgroundRoot.value != null);
  let uid = 0;

  function resolveBackgroundRoot() {
    const root = backgroundRoot.value;
    const target = portalTarget.value;

    if (root == null || target == null || !root.isConnected || !target.isConnected ||
      root.ownerDocument !== target.ownerDocument || root === root.ownerDocument.body ||
      root === root.ownerDocument.documentElement || root.contains(target)) {
      return null;
    }

    return root;
  }

  function open(options: OverlayOptions, context: OverlayContextSnapshot): OverlayHandle | undefined {
    if (disposed.value) {
      return undefined;
    }

    synchronizeModality();

    const root = availableBackgroundRoot.value;

    if (root == null) {
      throw new Error('Opening a modal requires a mounted <DrModalHost> with a backgroundRoot and a separate, connected portal in the same document. The backgroundRoot cannot be body, html or contain the portal.');
    }

    const token = Symbol();
    let closed = false;

    function close(restoreFocus = true) {
      if (closed) {
        return;
      }

      closed = true;
      layers.value = layers.value.filter((layer) => layer.token !== token);
      modality.value?.release(token, restoreFocus);
      options.onClose?.();
    }

    uid += 1;

    const layer: DrOverlayLayer = {
      uid,
      token,
      document: root.ownerDocument,
      context,
      content: options.content,
      closeOnBackdrop: options.closeOnBackdrop ?? defaultOverlayCloseOnBackdrop,
      close,
    };

    layers.value = [...layers.value, layer];
    modality.value?.register(token, root, close, options.opener);

    return { layer, close };
  }

  function closeAll(restoreFocus = true) {
    for (const layer of [...layers.value].reverse()) {
      layer.close(restoreFocus);
    }
  }

  function synchronizeModality(restoreFocus = true) {
    const root = resolveBackgroundRoot();

    availableBackgroundRoot.value = root;

    if (root == null) {
      closeAll(restoreFocus);
      modality.value = undefined;

      return;
    }

    const nextModality = getDocumentModality(root.ownerDocument);

    if (modality.value != null && modality.value !== nextModality) {
      closeAll(false);
    }

    modality.value = nextModality;

    for (const layer of layers.value) {
      nextModality.updateBackground(layer.token, root);
    }
  }

  function setBackgroundRoot(root: HTMLElement | null, restoreFocus = true) {
    if (disposed.value) {
      return;
    }

    if (root != null && backgroundRoot.value != null && root.ownerDocument !== backgroundRoot.value.ownerDocument) {
      closeAll(false);
    }

    backgroundRoot.value = root;
    synchronizeModality(restoreFocus);
  }

  function setPortalTarget(target: HTMLElement | null) {
    if (disposed.value) {
      return;
    }

    portalTarget.value = target;
    synchronizeModality();
  }

  function dispose() {
    disposed.value = true;
    closeAll(false);
    backgroundRoot.value = null;
    portalTarget.value = null;
    availableBackgroundRoot.value = null;
    modality.value = undefined;
  }

  return {
    canOpenModal,
    isModalAvailable: () => !disposed.value && resolveBackgroundRoot() != null,
    portalTarget: computed(() => portalTarget.value),
    layers: computed(() => layers.value),
    open,
    closeAll,
    setBackgroundRoot,
    setPortalTarget,
    dispose,
    isTop: (token: symbol) => modality.value?.isTop(token) ?? false,
    order: (token: symbol) => modality.value?.order(token) ?? 0,
  };
}
