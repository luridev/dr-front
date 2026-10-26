import { describe, expect, it, vi } from 'vitest';
import { defaultConfig } from '@/configuration/config';
import { createDocumentFixture, FocusTarget } from '@/overlays/lib/documentModality/document.support';
import { getDocumentModality } from '@/overlays/lib/documentModality/documentModality';
import { createOverlayContext } from '@/overlays/lib/overlayContext/overlayContext';

describe('document resource ownership', () => {
  it('shares only a Document coordinator and restores original overflow/inert after the last owner', () => {
    const fixture = createDocumentFixture();
    const { document } = fixture;
    const root = fixture.background();
    const otherRoot = fixture.background();
    const modality = getDocumentModality(document);
    const a = Symbol();
    const b = Symbol();
    const c = Symbol();

    document.body.style.setProperty('overflow', 'clip', 'important');
    root.setAttribute('inert', 'original');
    expect(getDocumentModality(document)).toBe(modality);
    expect(getDocumentModality(createDocumentFixture().document)).not.toBe(modality);
    modality.register(a, root, vi.fn());
    modality.register(b, root, vi.fn());
    modality.register(c, otherRoot, vi.fn());
    modality.register(c, otherRoot, vi.fn());
    expect(fixture.addListener).toHaveBeenCalledTimes(1);
    expect(modality.order(c)).toBe(2);
    expect(modality.isTop(b)).toBe(false);
    expect(modality.isTop(c)).toBe(true);
    modality.release(b);
    expect(root.getAttribute('inert')).toBe('');
    modality.release(a);
    expect(root.getAttribute('inert')).toBe('original');
    expect(document.body.style.getPropertyValue('overflow')).toBe('hidden');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    expect(otherRoot.getAttribute('inert')).toBe('');
    modality.release(c);
    modality.release(c);
    expect(modality.hasModal.value).toBe(false);
    expect(document.body.style.getPropertyValue('overflow')).toBe('clip');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    expect(document.documentElement.style.getPropertyValue('overflow')).toBe('');
    expect(otherRoot.getAttribute('inert')).toBeNull();
    expect(fixture.removeListener).toHaveBeenCalledTimes(1);
    expect(fixture.removeListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('invalidates a pending return target when another top layer opens', () => {
    const fixture = createDocumentFixture();
    const modality = getDocumentModality(fixture.document);
    const root = fixture.background();
    const opener = new FocusTarget();
    const replacementOpener = new FocusTarget();
    const a = Symbol();
    const b = Symbol();

    fixture.focus(opener);
    modality.register(a, root, vi.fn());
    const returnA = modality.focusReturnFor(a);
    expect(returnA()).toBe(false);
    modality.release(a);
    fixture.focus(replacementOpener);
    modality.register(b, root, vi.fn());
    const returnB = modality.focusReturnFor(b);
    expect(returnA()).toBe(false);
    expect(opener.focus).not.toHaveBeenCalled();
    modality.release(b);
    expect(returnB()).toBe(replacementOpener);
    expect(replacementOpener.focus).not.toHaveBeenCalled();
  });

  it.each(['disconnected', 'inert', 'suppressed'] as const)('skips %s return-focus targets', (reason) => {
    const fixture = createDocumentFixture();
    const modality = getDocumentModality(fixture.document);
    const target = new FocusTarget();
    const token = Symbol();

    fixture.focus(target);
    modality.register(token, fixture.background(), vi.fn());
    const returnFocus = modality.focusReturnFor(token);
    target.isConnected = reason !== 'disconnected';
    target.inert = reason === 'inert';
    modality.release(token, reason !== 'suppressed');
    expect(returnFocus()).toBe(false);
    expect(target.focus).not.toHaveBeenCalled();
  });

  it('captures an explicit opener without focusing it', () => {
    const fixture = createDocumentFixture();
    const modality = getDocumentModality(fixture.document);
    const active = new FocusTarget();
    const opener = new FocusTarget();
    const token = Symbol();
    fixture.focus(active);
    modality.register(token, fixture.background(), vi.fn(), opener as unknown as HTMLElement);
    const returnFocus = modality.focusReturnFor(token);
    modality.release(token);
    expect(returnFocus()).toBe(opener);
    expect(opener.focus).not.toHaveBeenCalled();
    expect(active.focus).not.toHaveBeenCalled();
    expect(modality.focusReturnFor(Symbol())()).toBe(false);
  });

  it('routes an unhandled Escape to just the current top layer and removes the listener at rest', () => {
    const fixture = createDocumentFixture();
    const modality = getDocumentModality(fixture.document);
    const root = fixture.background();
    const a = Symbol();
    const b = Symbol();

    const closeA = vi.fn(() => {
      modality.release(a);
    });

    const closeB = vi.fn(() => {
      modality.release(b);
    });

    modality.register(a, root, closeA);
    modality.register(b, root, closeB);
    fixture.keydown('Enter');
    fixture.keydown('Escape', true);
    expect(closeB).not.toHaveBeenCalled();
    expect(fixture.keydown().defaultPrevented).toBe(true);
    expect(closeB).toHaveBeenCalledOnce();
    expect(closeA).not.toHaveBeenCalled();
    fixture.keydown();
    expect(closeA).toHaveBeenCalledOnce();
    expect(fixture.keydown().defaultPrevented).toBe(false);
  });

  it.each(['body', 'html', 'null', 'non-html', 'no-window', 'explicit-null'] as const)(
    'does not infer an opener from %s',
    (reason) => {
      const fixture = createDocumentFixture();
      const modality = getDocumentModality(fixture.document);
      const token = Symbol();
      const target = new FocusTarget();

      const active = reason === 'body'
        ? fixture.document.body
        : reason === 'html'
          ? fixture.document.documentElement
          : reason === 'null' ? null : target;

      fixture.focus(active);

      if (reason === 'non-html') {
        Object.defineProperty(fixture.document, 'activeElement', { value: new EventTarget() });
      }

      if (reason === 'no-window') {
        Object.defineProperty(fixture.document, 'defaultView', { value: null });
      }

      modality.register(token, fixture.background(), vi.fn(), reason === 'explicit-null' ? null : undefined);
      const returnFocus = modality.focusReturnFor(token);
      modality.release(token);
      expect(returnFocus()).toBe(false);
      expect(target.focus).not.toHaveBeenCalled();
    },
  );

  it('keeps per-layer return targets and never restores a lower layer closed beneath another', () => {
    const fixture = createDocumentFixture();
    const modality = getDocumentModality(fixture.document);
    const a = Symbol();
    const b = Symbol();
    const openerA = new FocusTarget();
    const openerB = new FocusTarget();
    modality.register(a, fixture.background(), vi.fn(), openerA as unknown as HTMLElement);
    modality.register(b, fixture.background(), vi.fn(), openerB as unknown as HTMLElement);
    const returnA = modality.focusReturnFor(a);
    const returnB = modality.focusReturnFor(b);
    modality.release(a);
    expect(returnA()).toBe(false);
    modality.release(b);
    expect(returnB()).toBe(openerB);
  });

  it('registers a layer only once and keeps its original close callback', () => {
    const fixture = createDocumentFixture();
    const modality = getDocumentModality(fixture.document);
    const token = Symbol();
    const close = vi.fn();
    const duplicate = vi.fn();
    modality.register(token, fixture.background(), close);
    modality.register(token, fixture.background(), duplicate);
    fixture.keydown();
    expect(close).toHaveBeenCalledOnce();
    expect(duplicate).not.toHaveBeenCalled();
  });

  it('transfers background ownership without reordering layers, and unbinds disposed Hosts', () => {
    const fixture = createDocumentFixture();
    const root = fixture.background();
    const replacement = fixture.background();
    const anotherDocument = createDocumentFixture();
    const otherRoot = anotherDocument.background();
    const modality = getDocumentModality(fixture.document);
    const context = createOverlayContext();
    const content = { component: { render: () => null } };
    const close = vi.fn();

    expect(modality.hasModal.value).toBe(false);
    context.setBackgroundRoot(root);
    context.open({ content, onClose: close }, { toast: undefined, config: defaultConfig });
    const token = context.layers.value[0].token;

    expect(context.isTop(token)).toBe(true);
    expect(context.order(token)).toBe(0);
    const second = context.open({ content }, { toast: undefined, config: defaultConfig });
    const secondToken = context.layers.value[1].token;

    expect(context.isTop(token)).toBe(false);
    expect(context.isTop(secondToken)).toBe(true);
    expect(context.order(secondToken)).toBe(1);
    second?.close();
    context.setBackgroundRoot(root);
    context.setBackgroundRoot(replacement);
    expect(root.getAttribute('inert')).toBeNull();
    expect(replacement.getAttribute('inert')).toBe('');
    expect(context.order(token)).toBe(0);
    context.setBackgroundRoot(otherRoot);
    expect(modality.hasModal.value).toBe(false);
    expect(replacement.getAttribute('inert')).toBeNull();
    expect(getDocumentModality(anotherDocument.document).hasModal.value).toBe(true);
    context.setBackgroundRoot(null);
    expect(context.isTop(token)).toBe(false);
    expect(context.order(token)).toBe(0);
    expect(otherRoot.getAttribute('inert')).toBeNull();
    expect(context.layers.value).toHaveLength(0);
    expect(close).toHaveBeenCalledOnce();
    context.setBackgroundRoot(root);
    context.dispose();
    context.setBackgroundRoot(replacement);
    expect(close).toHaveBeenCalledOnce();
    expect(modality.hasModal.value).toBe(false);
    expect(root.getAttribute('inert')).toBeNull();
    expect(replacement.getAttribute('inert')).toBeNull();
  });
});
