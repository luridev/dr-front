import { createFocusTrap } from 'focus-trap';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { computed, nextTick, shallowRef } from 'vue';
import { useDialogFocus } from '@/overlays/lib/dialogFocus/useDialogFocus';
import { createDocumentFixture } from '@/overlays/lib/documentModality/document.support';
import { mountSetup } from '~/tests/vitest/setup.support';
import type { Options } from 'focus-trap';
import type { DialogFocusSetup } from '@/overlays/lib/dialogFocus/types';

vi.mock(import('focus-trap'), () => ({
  createFocusTrap: vi.fn(() => ({
    active: false,
    paused: false,
    activate: vi.fn(),
    deactivate: vi.fn(),
    pause: vi.fn(),
    unpause: vi.fn(),
    updateContainerElements: vi.fn(),
  })),
}));

async function openTrap(context: DialogFocusSetup) {
  const app = mountSetup(() => {
    useDialogFocus(context);
  });

  onTestFinished(() => {
    app.unmount();
  });

  await nextTick();

  return vi.mocked(createFocusTrap).mock.lastCall?.[1]?.setReturnFocus;
}

function createContext(returnFocus: DialogFocusSetup['returnFocus']): DialogFocusSetup {
  return { root: shallowRef(createDocumentFixture().document.body), active: computed(() => true), returnFocus };
}

function resolveTarget(setReturnFocus: Options['setReturnFocus']) {
  if (typeof setReturnFocus !== 'function') {
    throw new Error('Expected a return-focus callback.');
  }

  return setReturnFocus(createDocumentFixture().document.body);
}

describe('dialog return focus', () => {
  it('leaves focus restoration to the trap when no callback is provided', async () => {
    const setReturnFocus = await openTrap(createContext(undefined));

    expect(createFocusTrap).toHaveBeenCalledOnce();
    expect(setReturnFocus).toBeUndefined();
  });

  it('consults the current callback and tolerates its removal', async () => {
    const original = vi.fn<() => false>(() => false);
    const replacement = vi.fn<() => false>(() => false);
    const context = createContext(original);
    const setReturnFocus = await openTrap(context);

    context.returnFocus = replacement;
    const result = resolveTarget(setReturnFocus);

    expect(result).toBe(false);
    expect(replacement).toHaveBeenCalledOnce();
    expect(original).not.toHaveBeenCalled();

    context.returnFocus = undefined;
    expect(resolveTarget(setReturnFocus)).toBe(false);
    expect(replacement).toHaveBeenCalledOnce();
  });

  it.each([null, undefined])('declines a %s target returned by JavaScript', async (target) => {
    const context = createContext(undefined);
    Object.assign(context, { returnFocus: () => target });
    const setReturnFocus = await openTrap(context);

    expect(resolveTarget(setReturnFocus)).toBe(false);
  });
});
