import { createFocusTrap } from 'focus-trap';
import { isFocusable } from 'tabbable';
import { nextTick, onBeforeUnmount, watch } from 'vue';
import type { FocusTrap } from 'focus-trap';
import type { DialogFocusSetup } from '@/overlays/lib/dialogFocus/types';

const stacks = new WeakMap<Document, Array<FocusTrap>>();

export function useDialogFocus(context: DialogFocusSetup) {
  let trap: FocusTrap | undefined;
  let disposed = false;

  watch([context.root, context.active], async ([root, active]) => {
    await nextTick();

    if (disposed || root == null || root !== context.root.value || active !== context.active.value) {
      return;
    }

    if (!active) {
      trap?.pause();

      return;
    }

    if (trap == null) {
      const document = root.ownerDocument;
      let stack = stacks.get(document);

      if (stack == null) {
        stack = [];
        stacks.set(document, stack);
      }

      trap = createFocusTrap(root, {
        document,
        trapStack: stack,
        escapeDeactivates: false,
        allowOutsideClick: true,
        preventScroll: true,
        delayInitialFocus: false,
        initialFocus: () => root.querySelector<HTMLElement>('[data-dr-dialog-initial-focus], [autofocus]') ?? root,
        fallbackFocus: root,
        setReturnFocus: context.returnFocus == null
          ? undefined
          : () => {
              const target = context.returnFocus?.();

              return target != null && target !== false && isFocusable(target) ? target : false;
            },
      });

      trap.activate();
    } else {
      trap.unpause();
    }
  }, { flush: 'post', immediate: true });

  onBeforeUnmount(() => {
    disposed = true;
    trap?.deactivate();
  });
}
