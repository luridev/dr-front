import { afterEach, describe, expect, it, vi } from 'vitest';
import { computed, customRef, nextTick, ref, shallowRef } from 'vue';
import { useDrMaskedInputModel } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputModel/useDrMaskedInputModel';
import { nativeMasks, serialMask } from '@/forms/components/DrMaskedInput/config.support';
import { createTestEffectScopeCollector } from '~/tests/vitest/lib/createTestEffectScopeCollector/createTestEffectScopeCollector';
import type * as Vue from 'vue';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

const { mounted } = vi.hoisted(() => ({ mounted: new Array<() => void>() }));

vi.mock('vue', async (original) => ({
  ...await original<typeof Vue>(),
  onMounted: (callback: () => void) => mounted.push(callback),
}));

const scopes = createTestEffectScopeCollector();
afterEach(() => mounted.splice(0));

function createFixture(initial = '', initialMask: DrMask = '000-000', echo = true, mount = true) {
  const external = ref(initial);

  const writes = vi.fn((value: string) => {
    if (echo) {
      external.value = value;
    }
  });

  const model = customRef<string>(() => ({ get: () => external.value, set: writes }));
  const mask = shallowRef<DrMask>(initialMask);
  const status = vi.fn();

  const state = scopes.run(() => {
    const result = useDrMaskedInputModel({ model, mask: computed(() => mask.value), onStatusUpdate: status });

    if (mount) {
      mounted.shift()?.();
    }

    return result;
  });

  function edit(value: string) {
    state.masked.value.reset();
    state.masked.value.append(value, { input: true });
    state.accept();
  }

  return { ...state, external, mask, writes, status, edit };
}

describe('native mask model synchronization', () => {
  it('initializes external data without emitting a model write', () => {
    const fixture = createFixture('123456');
    expect(fixture.inputValue.value).toBe('123-456');
    expect(fixture.status.mock.calls).toEqual([['valid']]);
    expect(fixture.writes).not.toHaveBeenCalled();
  });

  it('publishes partial strings, deduplicates status and preserves the live engine on echoes', async () => {
    const fixture = createFixture();
    const engine = fixture.masked.value;

    for (const value of ['1', '12', '123456', '123456']) {
      fixture.edit(value);
      await nextTick();
      expect(fixture.masked.value).toBe(engine);
    }

    expect(fixture.writes.mock.calls).toEqual([['1'], ['12'], ['123456']]);
    expect(fixture.status.mock.calls).toEqual([['empty'], ['incomplete'], ['valid']]);
    fixture.updateInputValue('');
    await nextTick();
    expect(fixture.inputValue.value).toBe('');
    expect(fixture.status).toHaveBeenLastCalledWith('empty');
  });

  it('retains native drafts across rejected and delayed parent echoes', async () => {
    const fixture = createFixture('', nativeMasks.prepared, false);
    fixture.edit('a');
    await nextTick();
    fixture.edit('a');
    await nextTick();
    expect(fixture.writes.mock.calls).toEqual([['b']]);
    const engine = fixture.masked.value;
    fixture.external.value = 'b';
    await nextTick();
    expect(fixture.inputValue.value).toBe('b');
    expect(fixture.masked.value).toBe(engine);
    fixture.external.value = 'c';
    await nextTick();
    expect(fixture.inputValue.value).toBe('d');
    expect(fixture.writes.mock.calls).toEqual([['b'], ['d']]);
    expect(fixture.masked.value).toBe(engine);
  });

  it.each([
    ['1234567', '123456', '123-456', 'valid'],
    ['12a3', '123', '123', 'incomplete'],
    ['bad', '', '', 'empty'],
  ])('accepts native filtering of external %s and publishes it once', async (value, expected, display, status) => {
    const fixture = createFixture(value);
    const engine = fixture.masked.value;
    await nextTick();
    expect(fixture.inputValue.value).toBe(display);
    expect(fixture.external.value).toBe(expected);
    expect(fixture.status).toHaveBeenLastCalledWith(status);
    expect(fixture.writes.mock.calls).toEqual([[expected]]);
    expect(fixture.masked.value).toBe(engine);
    fixture.external.value = '9x8';
    await nextTick();
    expect(fixture.external.value).toBe('98');
    expect(fixture.inputValue.value).toBe('98');
    expect(fixture.masked.value).toBe(engine);
    expect(fixture.writes.mock.calls).toEqual([[expected], ['98']]);
  });

  it('keeps placeholders out of the model but retains native included literals', async () => {
    const fixture = createFixture('', nativeMasks.placeholders);
    expect(fixture.inputValue.value).toBe('+7 (___)');
    expect(fixture.external.value).toBe('7');
    expect(fixture.status).toHaveBeenLastCalledWith('empty');
    fixture.edit('71');
    await nextTick();
    expect(fixture.status).toHaveBeenLastCalledWith('incomplete');
    fixture.updateInputValue('');
    await nextTick();
    expect(fixture.external.value).toBe('7');
    expect(fixture.status).toHaveBeenLastCalledWith('empty');
  });

  it.each([
    [serialMask, 'AB1234', 'AB-1234', 'AB1234'],
    [nativeMasks.digits, '1'.repeat(400), '1'.repeat(400), '1'.repeat(400)],
    [nativeMasks.repeat, '12345', '12345', '12345'],
    [nativeMasks.function, '123', '123', '123'],
    [nativeMasks.range, '99', '90', '90'],
    [nativeMasks.enum, 'r', 'red', 'red'],
    [nativeMasks.number, '001.20', '1,2', '1.2'],
    [nativeMasks.date, '01022024', '01.02.2024', '01.02.2024'],
    [nativeMasks.prepared, 'ab', 'bc', 'bc'],
    [{ mask: Number, min: 5 }, '1', '5', '5'],
    [{ mask: '000-000', lazy: false }, '', '___-___', ''],
  ] as const)('accepts native external normalization: %s', async (mask, value, display, unmasked) => {
    const fixture = createFixture(value, mask);
    const engine = fixture.masked.value;
    await nextTick();
    expect(fixture.inputValue.value).toBe(display);
    expect(fixture.masked.value.unmaskedValue).toBe(unmasked);
    expect(fixture.external.value).toBe(unmasked);
    expect(fixture.writes.mock.calls).toEqual(value === unmasked ? [] : [[unmasked]]);
    expect(fixture.masked.value).toBe(engine);
  });

  it('reads prepareChar, displayChar and expose without reparsing', async () => {
    const prepared = createFixture('', nativeMasks.prepared);
    prepared.edit('ab');
    const hidden = createFixture('', nativeMasks.hidden);
    hidden.edit('123456');
    const exposed = createFixture('', nativeMasks.exposed);
    exposed.edit('1234');
    await nextTick();
    expect(prepared.external.value).toBe('bc');
    expect(prepared.inputValue.value).toBe('bc');
    expect(hidden.inputValue.value).toBe('###-###');
    expect(hidden.external.value).toBe('123456');
    expect(exposed.inputValue.value).toBe('12:34');
    expect(exposed.external.value).toBe('34');
  });

  it('switches dynamic branches according to native dispatch', async () => {
    const fixture = createFixture('', nativeMasks.dynamic);
    fixture.edit('1234');
    await nextTick();
    expect(fixture.inputValue.value).toBe('12-34');
    fixture.edit('AB123');
    await nextTick();
    expect(fixture.inputValue.value).toBe('AB-123');
    expect(fixture.external.value).toBe('AB123');
  });

  it('replaces config by identity, clears omitted options and uses new callback closures', async () => {
    const validator = (length: number) => (value: string) => value.length <= length;
    const fixture = createFixture('', { mask: /^\d*$/, validate: validator(2) });
    const engine = fixture.masked.value;
    const sameConfig = fixture.mask.value;
    fixture.mask.value = sameConfig;
    await nextTick();
    expect(fixture.masked.value).toBe(engine);
    fixture.mask.value = { mask: '0000', validate: validator(2) };
    await nextTick();
    fixture.edit('1234');
    await nextTick();
    expect(fixture.external.value).toBe('12');
    fixture.mask.value = { mask: '0000', validate: validator(4) };
    await nextTick();
    fixture.edit('1234');
    await nextTick();
    expect(fixture.external.value).toBe('1234');
    fixture.mask.value = { mask: '00-00' };
    await nextTick();
    expect(fixture.inputValue.value).toBe('12-34');
    fixture.mask.value = '00';
    await nextTick();
    expect(fixture.status).toHaveBeenLastCalledWith('valid');
    expect(fixture.inputValue.value).toBe('12');
    expect(fixture.external.value).toBe('12');
    expect(fixture.masked.value).not.toBe(engine);
  });
});

it('accepts a concrete ref/computed configuration and drops removed Number bounds', async () => {
  const config = ref<{ mask: NumberConstructor; min?: number }>({ mask: Number, min: 5 });
  const model = ref('1');
  const status = vi.fn();

  const state = scopes.run(() => {
    const result = useDrMaskedInputModel({ model, mask: computed(() => config.value), onStatusUpdate: status });
    mounted.shift()?.();

    return result;
  });

  expect(state.inputValue.value).toBe('5');
  expect(model.value).toBe('5');
  config.value = { mask: Number };
  await nextTick();
  expect(state.inputValue.value).toBe('5');
  model.value = '1';
  await nextTick();
  expect(state.inputValue.value).toBe('1');
  expect(model.value).toBe('1');
  expect(status.mock.calls).toEqual([['valid']]);
});

it('renders normalized initial text without publishing before mount', async () => {
  const fixture = createFixture('1', { mask: Number, min: 5 }, true, false);
  expect(fixture.inputValue.value).toBe('5');
  expect(fixture.external.value).toBe('1');
  expect(fixture.writes).not.toHaveBeenCalled();
  expect(fixture.status).not.toHaveBeenCalled();
  scopes.run(() => mounted.shift()?.());
  await nextTick();
  expect(fixture.external.value).toBe('5');
  expect(fixture.writes.mock.calls).toEqual([['5']]);
  expect(fixture.status.mock.calls).toEqual([['valid']]);
});

it('publishes external changes hidden by displayChar and retains exposed context', async () => {
  const fixture = createFixture('123456', nativeMasks.hidden);
  const engine = fixture.masked.value;
  fixture.external.value = '9876543';
  await nextTick();
  expect(fixture.inputValue.value).toBe('###-###');
  expect(fixture.external.value).toBe('987654');
  expect(fixture.writes.mock.calls).toEqual([['987654']]);
  expect(fixture.masked.value).toBe(engine);

  const exposed = createFixture('', nativeMasks.exposed);
  exposed.edit('1234');
  await nextTick();
  const exposedEngine = exposed.masked.value;
  exposed.external.value = '567';
  await nextTick();
  expect(exposed.inputValue.value).toBe('12:56');
  expect(exposed.external.value).toBe('56');
  expect(exposed.masked.value).toBe(exposedEngine);
});
