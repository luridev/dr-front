import { describe, expect, it } from 'vitest';
import { defaultConfig } from '@/configuration/config';
import { createDocumentFixture, FocusTarget } from '@/overlays/lib/documentModality/document.support';
import { getDocumentModality } from '@/overlays/lib/documentModality/documentModality';
import { createOverlayContext } from '@/overlays/lib/overlayContext/overlayContext';
import { requireValue } from '~/tests/vitest/setup.support';

const snapshot = { toast: undefined, config: defaultConfig };

describe('modal background boundaries', () => {
  it.each(['body', 'html', 'portal', 'ancestor', 'disconnected', 'other-document'] as const)(
    'rejects a %s background without acquiring document resources',
    (kind) => {
      const fixture = createDocumentFixture();
      const context = createOverlayContext();
      const portal = fixture.background();

      const roots = {
        body: fixture.document.body,
        html: fixture.document.documentElement,
        portal,
        ancestor: fixture.background(),
        disconnected: fixture.background(),
        'other-document': createDocumentFixture().background(),
      };

      roots.ancestor.appendChild(portal);
      Object.defineProperty(roots.disconnected, 'isConnected', { value: false });
      context.setPortalTarget(portal);
      context.setBackgroundRoot(roots[kind]);
      expect(context.canOpenModal.value).toBe(false);
      expect(() => context.open({}, snapshot)).toThrow('backgroundRoot');
      expect(context.layers.value).toHaveLength(0);
      expect(roots[kind].getAttribute('inert')).toBeNull();
      expect(fixture.document.body.style.getPropertyValue('overflow')).toBe('');
      expect(fixture.addListener).not.toHaveBeenCalled();
      context.dispose();
    },
  );

  it('requires a connected portal, releases it safely and permits reopening until disposed', () => {
    const fixture = createDocumentFixture();
    const context = createOverlayContext();
    const root = fixture.background();
    const portal = fixture.background();
    const opener = new FocusTarget();
    Object.defineProperty(portal, 'isConnected', { configurable: true, value: false });
    context.setBackgroundRoot(root);

    for (const target of [null, portal]) {
      context.setPortalTarget(target);
      expect(context.canOpenModal.value).toBe(false);
      expect(() => context.open({}, snapshot)).toThrow('connected portal');
    }

    Object.defineProperty(portal, 'isConnected', { value: true });
    context.setPortalTarget(portal);
    expect(context.canOpenModal.value).toBe(true);
    const handle = requireValue(context.open({ opener: opener as unknown as HTMLElement }, snapshot));
    const returnFocus = getDocumentModality(fixture.document).focusReturnFor(handle.layer.token);
    context.setPortalTarget(null);
    expect(context.canOpenModal.value).toBe(false);
    expect(returnFocus()).toBe(opener);
    expect(root.getAttribute('inert')).toBeNull();
    expect(fixture.document.body.style.getPropertyValue('overflow')).toBe('');
    context.setPortalTarget(portal);
    const reopened = requireValue(context.open({ opener: opener as unknown as HTMLElement }, snapshot));
    const returnReopenedFocus = getDocumentModality(fixture.document).focusReturnFor(reopened.layer.token);
    reopened.close();
    expect(returnReopenedFocus()).toBe(opener);
    expect(context.layers.value).toHaveLength(0);
    context.dispose();
    context.setBackgroundRoot(root);
    context.setPortalTarget(portal);
    expect(context.canOpenModal.value).toBe(false);
    expect(context.portalTarget.value).toBeNull();
    expect(context.open({}, snapshot)).toBeUndefined();
  });

  it.each(['set-background', 'open'] as const)('revalidates unchanged DOM references on %s', (operation) => {
    const fixture = createDocumentFixture();
    const context = createOverlayContext();
    const root = fixture.background();
    const portal = fixture.background();
    context.setBackgroundRoot(root);
    context.setPortalTarget(portal);
    context.open({}, snapshot);
    root.appendChild(portal);

    if (operation === 'set-background') {
      context.setBackgroundRoot(root);
    } else {
      expect(() => context.open({}, snapshot)).toThrow('contain the portal');
    }

    expect(context.canOpenModal.value).toBe(false);
    expect(context.layers.value).toHaveLength(0);
    expect(root.getAttribute('inert')).toBeNull();
    expect(fixture.document.body.style.getPropertyValue('overflow')).toBe('');
    context.dispose();
  });

  it('invalidating a Host closes only its layers in reverse order and preserves shared background ownership', () => {
    const fixture = createDocumentFixture();
    const root = fixture.background();
    const first = createOverlayContext();
    const second = createOverlayContext();
    const closed: Array<number> = [];

    for (const context of [first, second]) {
      context.setBackgroundRoot(root);
      context.setPortalTarget(fixture.background());
    }

    const handle = requireValue(first.open({ onClose: () => closed.push(1) }, snapshot));
    first.open({ onClose: () => closed.push(2) }, snapshot);
    const other = requireValue(second.open({ opener: new FocusTarget() as unknown as HTMLElement }, snapshot));
    const returnFocus = getDocumentModality(fixture.document).focusReturnFor(other.layer.token);
    first.setBackgroundRoot(fixture.document.body);
    handle.close();
    expect(closed).toEqual([2, 1]);
    expect(first.canOpenModal.value).toBe(false);
    expect(second.isTop(other.layer.token)).toBe(true);
    expect(root.getAttribute('inert')).toBe('');
    expect(fixture.document.body.style.getPropertyValue('overflow')).toBe('hidden');
    second.dispose();
    expect(returnFocus()).toBe(false);
    expect(root.getAttribute('inert')).toBeNull();
    expect(fixture.document.body.style.getPropertyValue('overflow')).toBe('');
    first.dispose();
  });

  it.each([undefined, false])('sets readiness before closing and honors restoreFocus=%s when the Host becomes unavailable', (restoreFocus) => {
    const fixture = createDocumentFixture();
    const context = createOverlayContext();
    const opener = new FocusTarget();
    const readyAtClose: Array<boolean> = [];
    context.setBackgroundRoot(fixture.background());
    context.setPortalTarget(fixture.background());

    const handle = requireValue(context.open({
      opener: opener as unknown as HTMLElement,
      onClose: () => readyAtClose.push(context.canOpenModal.value),
    }, snapshot));

    const returnFocus = getDocumentModality(fixture.document).focusReturnFor(handle.layer.token);
    context.setBackgroundRoot(null, restoreFocus);
    expect(readyAtClose).toEqual([false]);
    expect(returnFocus()).toBe(restoreFocus === false ? false : opener);
    context.dispose();
  });

  it('keeps layer order when replacing the background but closes layers before changing documents', () => {
    const fixture = createDocumentFixture();
    const otherDocument = createDocumentFixture();
    const context = createOverlayContext();
    const sibling = createOverlayContext();
    const root = fixture.background();
    const siblingRoot = fixture.background();
    const replacement = fixture.background();
    const otherRoot = otherDocument.background();
    context.setBackgroundRoot(root);
    context.setPortalTarget(fixture.background());
    sibling.setBackgroundRoot(siblingRoot);
    sibling.setPortalTarget(fixture.background());
    const second = requireValue(sibling.open({}, snapshot));
    const first = requireValue(context.open({ opener: new FocusTarget() as unknown as HTMLElement }, snapshot));
    const returnFocus = getDocumentModality(fixture.document).focusReturnFor(first.layer.token);
    context.setBackgroundRoot(replacement);
    expect(root.getAttribute('inert')).toBeNull();
    expect(replacement.getAttribute('inert')).toBe('');
    expect(siblingRoot.getAttribute('inert')).toBe('');
    expect(context.order(first.layer.token)).toBe(1);
    expect(context.order(second.layer.token)).toBe(0);
    expect(context.isTop(first.layer.token)).toBe(true);
    sibling.dispose();
    context.setBackgroundRoot(otherRoot);
    expect(context.layers.value).toHaveLength(0);
    expect(context.canOpenModal.value).toBe(false);
    expect(returnFocus()).toBe(false);
    expect(replacement.getAttribute('inert')).toBeNull();
    context.setPortalTarget(otherDocument.background());
    context.open({}, snapshot);
    expect(otherRoot.getAttribute('inert')).toBe('');
    context.dispose();
    expect(otherRoot.getAttribute('inert')).toBeNull();
  });
});
