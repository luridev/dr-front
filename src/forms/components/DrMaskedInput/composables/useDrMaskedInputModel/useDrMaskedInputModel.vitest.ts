import { afterEach, describe, expect, it, vi } from 'vitest';
import { computed, customRef, nextTick, ref } from 'vue';
import { useDrMaskedInputModel } from '@/forms/components/DrMaskedInput/composables/useDrMaskedInputModel/useDrMaskedInputModel';
import { createMaskCodec } from '@/forms/components/DrMaskedInput/lib/maskCodec/maskCodec';
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

function createFixture(initial = '', initialMask: DrMask = { type: 'integer' }, echo = true) {
  const external = ref(initial);

  const writes = vi.fn((value: string) => {
    if (echo) {
      external.value = value;
    }
  });

  const model = customRef<string>(() => ({ get: () => external.value, set: writes }));
  const mask = ref(initialMask);
  const status = vi.fn();

  const state = scopes.run(() => {
    const result = useDrMaskedInputModel({
      model,
      codec: computed(() => createMaskCodec(mask.value)),
      onStatusUpdate: status,
    });

    mounted.shift()?.();

    return result;
  });

  return { ...state, external, mask, writes, status };
}

describe('masked model synchronization', () => {
  it('initializes canonical data and emits status once without a model write', async () => {
    const fixture = createFixture('1234');
    await nextTick();
    expect(fixture.inputValue.value).toBe('1\u00a0234');
    expect(fixture.status.mock.calls).toEqual([['valid']]);
    expect(fixture.writes).not.toHaveBeenCalled();
  });

  it('retains drafts across own echoes and publishes only distinct canonical values', async () => {
    const fixture = createFixture();

    for (const draft of ['01', '001', '002']) {
      fixture.updateInputValue(draft);
      await nextTick();
      expect(fixture.inputValue.value).toBe(draft);
    }

    expect(fixture.writes.mock.calls).toEqual([['1'], ['2']]);
    expect(fixture.status.mock.calls).toEqual([['empty'], ['valid']]);
  });

  it('publishes partial pattern models', async () => {
    const fixture = createFixture('', '000-000');
    fixture.updateInputValue('123-');
    await nextTick();
    expect(fixture.external.value).toBe('123');
    expect(fixture.inputValue.value).toBe('123-');
    expect(fixture.status).toHaveBeenLastCalledWith('incomplete');
  });

  it('deduplicates unaccepted updates and accepts a delayed echo or overriding external value', async () => {
    const fixture = createFixture('', { type: 'integer' }, false);
    fixture.updateInputValue('01');
    await nextTick();
    fixture.updateInputValue('001');
    await nextTick();
    expect(fixture.external.value).toBe('');
    expect(fixture.writes.mock.calls).toEqual([['1']]);
    fixture.external.value = '1';
    await nextTick();
    expect(fixture.inputValue.value).toBe('001');
    fixture.external.value = '1234';
    await nextTick();
    expect(fixture.inputValue.value).toBe('1\u00a0234');
    expect(fixture.writes.mock.calls).toEqual([['1']]);
  });

  it('keeps incompatible external values intact until a user edit', async () => {
    const fixture = createFixture('1234567', '000-000');
    expect(fixture.inputValue.value).toBe('1234567');
    expect(fixture.invalidExternal.value).toBe(true);
    expect(fixture.status).toHaveBeenLastCalledWith('invalid');
    expect(fixture.writes).not.toHaveBeenCalled();
    fixture.updateInputValue('12');
    await nextTick();
    expect(fixture.external.value).toBe('12');
    expect(fixture.invalidExternal.value).toBe(false);
  });

  it('reformats on mask changes and detects a newly incompatible model without emitting it', async () => {
    const fixture = createFixture('123456', '000-000');
    fixture.mask.value = '00/00/00';
    await nextTick();
    expect(fixture.inputValue.value).toBe('12/34/56');
    fixture.mask.value = '00';
    await nextTick();
    expect(fixture.inputValue.value).toBe('123456');
    expect(fixture.status).toHaveBeenLastCalledWith('invalid');
    fixture.external.value = '';
    await nextTick();
    expect(fixture.inputValue.value).toBe('');
    expect(fixture.status).toHaveBeenLastCalledWith('empty');
    expect(fixture.writes).not.toHaveBeenCalled();
  });
});
