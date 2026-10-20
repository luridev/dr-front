import { computed, nextTick, shallowRef } from 'vue';
import type { BackgroundOwnership, DocumentLayer, OverflowSnapshot } from '@/overlays/lib/documentModality/types';

const documents = new WeakMap<Document, ReturnType<typeof createDocumentModality>>();

function createDocumentModality(document: Document) {
  const layers = shallowRef<ReadonlyArray<DocumentLayer>>([]);
  const backgrounds = new Map<HTMLElement, BackgroundOwnership>();
  let overflow: Array<OverflowSnapshot> = [];

  function topToken() {
    return layers.value.at(-1)?.token;
  }

  function acquireBackground(root: HTMLElement, token: symbol) {
    let ownership = backgrounds.get(root);

    if (ownership == null) {
      ownership = { owners: new Set(), originalInert: root.getAttribute('inert') };
      backgrounds.set(root, ownership);
      root.setAttribute('inert', '');
    }

    ownership.owners.add(token);
  }

  function releaseBackground(root: HTMLElement, token: symbol) {
    const ownership = backgrounds.get(root);

    if (ownership == null) {
      return;
    }

    ownership.owners.delete(token);

    if (ownership.owners.size > 0) {
      return;
    }

    if (ownership.originalInert == null) {
      root.removeAttribute('inert');
    } else {
      root.setAttribute('inert', ownership.originalInert);
    }

    backgrounds.delete(root);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.defaultPrevented) {
      return;
    }

    const top = layers.value.at(-1);

    if (top != null) {
      event.preventDefault();
      event.stopPropagation();
      top.close();
    }
  }

  function register(token: symbol, backgroundRoot: HTMLElement, close: () => void) {
    if (layers.value.some((layer) => layer.token === token)) {
      return;
    }

    if (layers.value.length === 0) {
      overflow = [document.body, document.documentElement].map((element) => ({
        element,
        value: element.style.getPropertyValue('overflow'),
        priority: element.style.getPropertyPriority('overflow'),
      }));

      for (const { element } of overflow) {
        element.style.setProperty('overflow', 'hidden', 'important');
      }

      document.addEventListener('keydown', handleKeydown);
    }

    const activeElement = document.activeElement;
    const elementType = document.defaultView?.HTMLElement;
    const restoreFocusTo = elementType != null && activeElement instanceof elementType ? activeElement : undefined;

    acquireBackground(backgroundRoot, token);
    layers.value = [...layers.value, { token, backgroundRoot, close, restoreFocusTo }];
  }

  function release(token: symbol, restoreFocus = true) {
    const layer = layers.value.find((entry) => entry.token === token);

    if (layer == null) {
      return;
    }

    const wasTop = topToken() === token;

    layers.value = layers.value.filter((entry) => entry.token !== token);
    releaseBackground(layer.backgroundRoot, token);

    if (layers.value.length === 0) {
      for (const { element, value, priority } of overflow) {
        if (value === '') {
          element.style.removeProperty('overflow');
        } else {
          element.style.setProperty('overflow', value, priority);
        }
      }

      overflow = [];
      document.removeEventListener('keydown', handleKeydown);
    }

    if (wasTop && restoreFocus) {
      const expectedTop = topToken();

      void nextTick(() => {
        const target = layer.restoreFocusTo;

        if (topToken() === expectedTop && target?.isConnected === true && target.closest('[inert]') == null) {
          target.focus();
        }
      });
    }
  }

  function updateBackground(token: symbol, backgroundRoot: HTMLElement) {
    const layer = layers.value.find((entry) => entry.token === token);

    if (layer == null || layer.backgroundRoot === backgroundRoot) {
      return;
    }

    releaseBackground(layer.backgroundRoot, token);
    acquireBackground(backgroundRoot, token);
    layer.backgroundRoot = backgroundRoot;
  }

  return {
    hasModal: computed(() => layers.value.length > 0),
    register,
    release,
    updateBackground,
    isTop: (token: symbol) => topToken() === token,
    order: (token: symbol) => layers.value.findIndex((layer) => layer.token === token),
  };
}

export function getDocumentModality(document: Document) {
  let modality = documents.get(document);

  if (modality == null) {
    modality = createDocumentModality(document);
    documents.set(document, modality);
  }

  return modality;
}
