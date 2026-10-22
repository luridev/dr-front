import { describe, expect, it } from 'vitest';
import { computed, nextTick, ref } from 'vue';
import { useDrInputNumberModel } from '@/forms/components/DrInputNumber/composables/useDrInputNumberModel/useDrInputNumberModel';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { createTestEffectScopeCollector } from '~/tests/vitest/lib/createTestEffectScopeCollector/createTestEffectScopeCollector';
import type { ModelRef } from 'vue';
import type { DrLocale } from '@/configuration/types';

const scopes = createTestEffectScopeCollector();

function createModel(value: number | null): ModelRef<number | null> {
  return ref(value) as ModelRef<number | null>;
}

function setupModel(value: number | null, initialLocale: DrLocale = 'en-US') {
  const model = createModel(value);
  const locale = ref(initialLocale);
  const thousandSeparator = computed(() => getInputLocaleProfile(locale.value).number.group);
  const result = scopes.run(() => useDrInputNumberModel({ model, thousandSeparator }));

  return { model, locale, ...result };
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

  it.each(['ru-RU', 'en-US', 'en-GB'] as const)('formats and parses using the %s separator', async (locale) => {
    const { group } = getInputLocaleProfile(locale).number;
    const result = setupModel(1234567, locale);

    expect(result.inputValue.value).toBe(['1', '234', '567'].join(group));

    result.updateInputValue(['-7', '654', '321'].join(group));
    await nextTick();
    expect(result.model.value).toBe(-7654321);
    expect(result.inputValue.value).toBe(['-7', '654', '321'].join(group));

    result.model.value = 9999;
    await nextTick();
    expect(result.inputValue.value).toBe(['9', '999'].join(group));
  });

  it.each([
    { chunks: ['1', '234', '567'], value: 1234567 },
    { chunks: ['-001', '234'], value: -1234 },
    { chunks: ['-0'], value: 0 },
    { chunks: ['-'], value: null },
    { chunks: ['9', '007', '199', '254', '740', '993'], value: null },
    { chunks: ['1.5'], value: null },
  ])('preserves the draft and model across locale changes: $chunks', async ({ chunks, value }) => {
    const result = setupModel(null, 'ru-RU');
    result.updateInputValue(chunks.join(getInputLocaleProfile('ru-RU').number.group));
    await nextTick();

    for (const locale of ['en-US', 'en-GB', 'ru-RU'] as const) {
      result.locale.value = locale;
      await nextTick();

      expect(result.inputValue.value).toBe(chunks.join(getInputLocaleProfile(locale).number.group));
      expect(result.model.value).toBe(value);
    }

    result.updateInputValue(['2', '345'].join(getInputLocaleProfile('ru-RU').number.group));
    await nextTick();
    expect(result.model.value).toBe(2345);
  });

  it('applies a simultaneous external model and locale update', async () => {
    const result = setupModel(1234, 'ru-RU');

    result.locale.value = 'en-US';
    result.model.value = -7654321;
    await nextTick();

    expect(result.inputValue.value).toBe(['-7', '654', '321'].join(getInputLocaleProfile('en-US').number.group));
    expect(result.model.value).toBe(-7654321);
  });
});
