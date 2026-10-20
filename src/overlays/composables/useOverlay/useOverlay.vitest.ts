import { describe, expect, it, vi } from 'vitest';
import { createSSRApp, defineComponent, effectScope, h, inject, provide } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import { drToastKey } from '@/feedback/toasts/keys';
import { createToastState } from '@/feedback/toasts/lib/toastState/toastState';
import DrModalHost from '@/overlays/components/DrModalHost/DrModalHost.vue';
import { useOverlay } from '@/overlays/composables/useOverlay/useOverlay';
import { drOverlayKey } from '@/overlays/keys';
import { createDocumentFixture } from '@/overlays/lib/documentModality/document.support';
import { createOverlayContext } from '@/overlays/lib/overlayContext/overlayContext';
import { mountSetup, requireValue } from '~/tests/vitest/setup.support';
import type { UseOverlay } from '@/overlays/composables/useOverlay/types';

const content = { component: { render: () => null } };

describe('overlay ownership', () => {
  it('uses the nearest nested modal Host and updates dialog state through normal Host disposal', async () => {
    const contexts: Array<ReturnType<typeof createOverlayContext>> = [];
    const dialogs: Array<ReturnType<typeof useDialog>> = [];

    const Probe = defineComponent({
      setup() {
        contexts.push(requireValue(inject(drOverlayKey)));
        dialogs.push(useDialog({ title: 'Dialog', component: content.component }));

        return () => h('span', 'slot');
      },
    });

    const app = createSSRApp(() => h(DrModalHost, { backgroundRoot: null }, {
      default: () => [
        h(Probe),
        h(DrModalHost, { backgroundRoot: null }, { default: () => h(Probe) }),
        h(Probe),
      ],
    }));

    await renderToString(app);
    expect(contexts[0]).toBe(contexts[2]);
    expect(contexts[0]).not.toBe(contexts[1]);

    for (const dialog of dialogs) {
      expect(dialog.canOpenModal.value).toBe(false);

      expect(() => {
        dialog.open();
      }).toThrow('mounted <DrModalHost> with a backgroundRoot');

      expect(dialog.isOpen.value).toBe(false);
    }

    const fixture = createDocumentFixture();

    contexts[0].setBackgroundRoot(fixture.background());
    contexts[1].setBackgroundRoot(fixture.background());

    for (const dialog of dialogs) {
      expect(dialog.canOpenModal.value).toBe(true);
      dialog.open();
      expect(dialog.isOpen.value).toBe(true);
    }

    expect(contexts[0].layers.value).toHaveLength(2);
    expect(contexts[1].layers.value).toHaveLength(1);
    contexts[1].setBackgroundRoot(null);
    expect(dialogs[1].canOpenModal.value).toBe(false);
    expect(dialogs[1].isOpen.value).toBe(false);
    expect(dialogs[0].isOpen.value).toBe(true);
    contexts[0].dispose();
    expect(dialogs[0].canOpenModal.value).toBe(false);
    expect(dialogs[0].isOpen.value).toBe(false);
    expect(dialogs[2].isOpen.value).toBe(false);
    dialogs[0].open();
    expect(dialogs[0].isOpen.value).toBe(false);
    expect(contexts[0].layers.value).toEqual([]);
  });

  it('keeps independent stacks, closes in reverse order and prevents opens after Host disposal', () => {
    const a = createOverlayContext();
    const b = createOverlayContext();
    const closed: Array<number> = [];
    const snapshot = { toast: undefined };
    const fixture = createDocumentFixture();

    a.setBackgroundRoot(fixture.background());
    b.setBackgroundRoot(fixture.background());

    const first = requireValue(a.open({ content, onClose: () => closed.push(1) }, snapshot));

    a.open({ content, onClose: () => closed.push(2) }, snapshot);
    b.open({ content }, snapshot);
    expect(a.layers.value).toHaveLength(2);
    expect(b.layers.value).toHaveLength(1);
    a.dispose();
    first.close();
    expect(closed).toEqual([2, 1]);
    expect(a.layers.value).toEqual([]);
    expect(b.layers.value).toHaveLength(1);
    expect(a.open({ content }, snapshot)).toBeUndefined();
    b.dispose();
  });

  it('captures only known dependencies and disposes an owner without closing another owner', () => {
    const context = createOverlayContext();
    const toast = createToastState().service;
    const closed = vi.fn();
    const order: Array<number> = [];
    let owner!: UseOverlay;
    let other!: UseOverlay;
    const scope = effectScope();

    const app = mountSetup(() => {
      scope.run(() => {
        owner = useOverlay();
      });

      other = useOverlay();
    }, () => {
      provide(drOverlayKey, context);
      provide(drToastKey, toast);
    });

    expect(owner.canOpenModal.value).toBe(false);
    context.setBackgroundRoot(createDocumentFixture().background());
    expect(owner.canOpenModal.value).toBe(true);
    owner.open({ content, onClose: () => order.push(1) });
    owner.open({ content, onClose: () => order.push(2) });
    const retained = requireValue(other.open({ content, closeOnBackdrop: true, onClose: closed }));

    expect(context.layers.value[0].context.toast).toBe(toast);
    expect(context.layers.value[0].closeOnBackdrop).toBe(false);
    expect(context.layers.value[2].closeOnBackdrop).toBe(true);
    scope.stop();
    expect(owner.canOpenModal.value).toBe(false);
    expect(other.canOpenModal.value).toBe(true);
    expect(order).toEqual([2, 1]);
    expect(context.layers.value).toHaveLength(1);
    expect(owner.open({ content })).toBeUndefined();
    retained.close();
    retained.close();
    expect(closed).toHaveBeenCalledOnce();
    app.unmount();
    expect(other.open({ content })).toBeUndefined();
    expect(context.layers.value).toEqual([]);
  });

  it('requires a Host only when opening, and stays inactive after scope disposal', () => {
    const scope = effectScope();
    const overlay = requireValue(scope.run(useOverlay));

    expect(overlay.canOpenModal.value).toBe(false);
    expect(() => overlay.open({ content })).toThrow('ancestor <DrModalHost>');
    scope.stop();
    expect(overlay.open({ content })).toBeUndefined();
  });
});
