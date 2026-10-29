import { describe, expect, it } from 'vitest';
import { defaultConfig } from '@/configuration/config';
import { createTranslator } from '@/configuration/lib/createTranslator/createTranslator';
import { getToastDuration, getToastTitle } from '@/feedback/toasts/lib/toastPresentation/toastPresentation';
import { createToastState } from '@/feedback/toasts/lib/toastState/toastState';
import { requireValue } from '~/tests/vitest/setup.support';

const t = createTranslator(defaultConfig);

describe('Host-owned toast queue', () => {
  it('keeps FIFO order, replaces queued duplicates in place and ignores stale dismissals', () => {
    const state = createToastState();
    const first = state.service.info({ message: 'first' });
    const second = state.service.error({ message: 'second', duration: 500 });
    const third = state.service.warning({ message: 'third' });

    expect(state.service.error({ message: ' second ', duration: 900 })).toBe(second);
    expect(state.activeToast.value?.uid).toBe(first);
    expect(state.activeToast.value?.variant).toBe('info');
    state.dismissToast(second);
    expect(state.activeToast.value?.uid).toBe(first);
    state.dismissToast(first);
    expect(state.activeToast.value).toMatchObject({ uid: second, message: 'second', duration: 900, variant: 'error' });
    state.dismissToast(first);
    expect(state.activeToast.value?.uid).toBe(second);
    state.dismissToast(second);
    expect(state.activeToast.value).toMatchObject({ uid: third, variant: 'warning' });
    state.dismissToast(third);
    expect(state.activeToast.value).toBeUndefined();
  });

  it('repeats the active item with its ID and updated duration, leaving its queue intact', () => {
    const state = createToastState();
    const id = state.service.success({ title: ' Saved ', message: ' done ', duration: 100 });
    const previous = state.activeToast.value;
    const next = state.service.info({ message: 'next' });

    expect(state.service.success({ title: 'Saved', message: 'done', duration: 400 })).toBe(id);
    expect(state.activeToast.value).not.toBe(previous);
    expect(state.activeToast.value).toMatchObject({ uid: id, duration: 400, variant: 'success' });
    state.dismissToast(id);
    expect(state.activeToast.value?.uid).toBe(next);
  });

  it('keeps automatic titles distinct from explicit text, resolving the configured title at presentation', () => {
    const state = createToastState();
    const auto = state.service.error({ message: 'Failed' });
    const automatic = requireValue(state.activeToast.value);
    const explicit = state.service.error({ title: 'Application error', message: 'Failed' });

    expect(automatic.title).toBeUndefined();
    expect(getToastTitle(automatic, t)).toBe('Error');
    expect(explicit).not.toBe(auto);
    expect(state.service.error({ title: '   ', message: 'Failed' })).toBe(auto);
    state.dismissToast(auto);
    expect(state.activeToast.value?.title).toBe('Application error');
    expect(state.activeToast.value?.key).not.toBe(automatic.key);
  });

  it.each([1, 30_000])('accepts explicit duration %i', (duration) => {
    const state = createToastState();

    state.service.show({ message: 'message', duration });
    expect(state.activeToast.value?.variant).toBe('info');
    expect(getToastDuration(requireValue(state.activeToast.value), t)).toBe(duration);
  });

  it.each([undefined, 0, -1, 1.5, 30_001, Number.NaN, Infinity])('falls back from invalid duration %s', (duration) => {
    const state = createToastState();

    state.service.show({ message: 'message', duration });
    expect(state.activeToast.value?.duration).toBeUndefined();
    expect(getToastDuration(requireValue(state.activeToast.value), t)).toBe(6000);
  });

  it('bounds automatic duration and counts normalized Unicode code points', () => {
    const state = createToastState();

    state.service.info({ title: 'A', message: `${'😀'.repeat(100)}\n  B` });
    expect(getToastDuration(requireValue(state.activeToast.value), t)).toBe(9200);
    state.dismissToast(requireValue(state.activeToast.value).uid);
    state.service.info({ message: 'x'.repeat(1000) });
    expect(getToastDuration(requireValue(state.activeToast.value), t)).toBe(30_000);
  });

  it('isolates state and local IDs, disposes only its own queue and rejects late async calls', async () => {
    const first = createToastState();
    const second = createToastState();

    expect(first.service.info({ message: 'first' })).toBe(1);
    expect(second.service.info({ message: 'second' })).toBe(1);
    first.service.info({ message: 'queued' });
    first.dispose();
    await Promise.resolve();
    expect(first.service.error({ message: 'late' })).toBe(0);
    first.dismissToast(1);
    expect(first.activeToast.value).toBeUndefined();
    expect(second.activeToast.value?.message).toBe('second');
    expect(createToastState().service.info({ message: 'new Host' })).toBe(1);
  });
});
