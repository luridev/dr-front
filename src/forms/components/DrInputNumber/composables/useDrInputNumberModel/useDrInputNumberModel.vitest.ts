import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { useDrInputNumberModel } from '@/forms/components/DrInputNumber/composables/useDrInputNumberModel/useDrInputNumberModel';
import { createTestEffectScopeCollector } from '~/tests/vitest/lib/createTestEffectScopeCollector/createTestEffectScopeCollector';
import type { ModelRef } from 'vue';

const scopes = createTestEffectScopeCollector();

function createModel(value: number | null): ModelRef<number | null> {
  return ref(value) as ModelRef<number | null>;
}

function setupModel(value: number | null) {
  const model = createModel(value);
  const result = scopes.run(() => useDrInputNumberModel({ model }));

  return { model, ...result };
}

describe('useDrInputNumberModel', () => {
  it.each([
    { value: null, inputValue: '', canToggleSign: true },
    { value: 0, inputValue: '0', canToggleSign: false },
    { value: 42, inputValue: '42', canToggleSign: true },
    { value: -42, inputValue: '-42', canToggleSign: true },
    { value: -0, inputValue: '0', canToggleSign: false },
  ])('initializes model $value', ({ value, inputValue, canToggleSign }) => {
    const result = setupModel(value);

    expect(result.inputValue.value).toBe(inputValue);
    expect(result.canToggleSign.value).toBe(canToggleSign);
  });

  it.each([
    { source: '', expected: null },
    { source: '0', expected: 0 },
    { source: '12', expected: 12 },
    { source: '-12', expected: -12 },
    { source: 'invalid', expected: null },
  ])('synchronizes user input $source with the model', ({ source, expected }) => {
    const result = setupModel(7);

    result.updateInputValue(source);

    expect(result.inputValue.value).toBe(source);
    expect(result.model.value).toBe(expected);
  });

  it('preserves a pending minus sign until blur or an external update', async () => {
    const result = setupModel(7);

    result.updateInputValue('-');
    await nextTick();

    expect(result.model.value).toBeNull();
    expect(result.inputValue.value).toBe('-');
    expect(result.canToggleSign.value).toBe(true);

    result.model.value = 5;
    await nextTick();

    expect(result.inputValue.value).toBe('5');
  });

  it('canonicalizes only a pending minus sign', () => {
    const result = setupModel(null);

    result.updateInputValue('-');

    expect(result.canonicalizeInputValue()).toBe(true);
    expect(result.inputValue.value).toBe('');
    expect(result.canonicalizeInputValue()).toBe(false);

    result.updateInputValue('12');

    expect(result.canonicalizeInputValue()).toBe(false);
    expect(result.inputValue.value).toBe('12');
  });

  it('normalizes -0 in the model while preserving the entered sign until external synchronization', async () => {
    const result = setupModel(null);

    result.updateInputValue('-0');
    await nextTick();

    expect(result.model.value).toBe(0);
    expect(Object.is(result.model.value, -0)).toBe(false);
    expect(result.inputValue.value).toBe('-0');
    expect(result.canToggleSign.value).toBe(false);

    result.model.value = 1;
    await nextTick();
    result.model.value = 0;
    await nextTick();

    expect(result.inputValue.value).toBe('0');
  });

  it('toggles the pending sign for a null model', () => {
    const result = setupModel(null);

    expect(result.toggleSign()).toBe(true);
    expect(result.inputValue.value).toBe('-');
    expect(result.model.value).toBeNull();

    expect(result.toggleSign()).toBe(true);
    expect(result.inputValue.value).toBe('');
    expect(result.model.value).toBeNull();
  });

  it('toggles the numeric model sign and synchronizes the input', async () => {
    const result = setupModel(12);

    expect(result.toggleSign()).toBe(true);
    expect(result.model.value).toBe(-12);

    await nextTick();
    expect(result.inputValue.value).toBe('-12');

    expect(result.toggleSign()).toBe(true);
    expect(result.model.value).toBe(12);

    await nextTick();
    expect(result.inputValue.value).toBe('12');
  });

  it('does not toggle the sign for zero or invalid input', () => {
    const zeroResult = setupModel(0);

    expect(zeroResult.toggleSign()).toBe(false);
    expect(zeroResult.model.value).toBe(0);
    expect(zeroResult.inputValue.value).toBe('0');

    const invalidResult = setupModel(null);

    invalidResult.updateInputValue('invalid');

    expect(invalidResult.canToggleSign.value).toBe(false);
    expect(invalidResult.toggleSign()).toBe(false);
    expect(invalidResult.inputValue.value).toBe('invalid');
  });

  it('synchronizes positive, negative and null external model updates', async () => {
    const result = setupModel(1);

    result.model.value = 5;
    await nextTick();
    expect(result.inputValue.value).toBe('5');

    result.model.value = -8;
    await nextTick();
    expect(result.inputValue.value).toBe('-8');

    result.model.value = null;
    await nextTick();
    expect(result.inputValue.value).toBe('');
  });
});
