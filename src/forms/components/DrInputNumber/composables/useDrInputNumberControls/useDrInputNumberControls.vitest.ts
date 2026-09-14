import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useDrInputNumberControls } from '@/forms/components/DrInputNumber/composables/useDrInputNumberControls/useDrInputNumberControls';
import { createTestEffectScopeCollector } from '~/tests/vitest/lib/createTestEffectScopeCollector/createTestEffectScopeCollector';
import type { ModelRef } from 'vue';

const scopes = createTestEffectScopeCollector();

function createModel(value: number | null): ModelRef<number | null> {
  return ref(value) as ModelRef<number | null>;
}

function setupControls(
  modelValue: number | null,
  minValue?: number,
  maxValue?: number,
  stepValue = 1,
  disabledValue = false,
) {
  const model = createModel(modelValue);
  const min = ref(minValue);
  const max = ref(maxValue);
  const step = ref(stepValue);
  const disabled = ref(disabledValue);

  const controls = scopes.run(() =>
    useDrInputNumberControls({
      model,
      min,
      max,
      step,
      disabled,
    }),
  );

  return { model, minSource: min, maxSource: max, step, disabled, ...controls };
}

describe('useDrInputNumberControls', () => {
  it('увеличивает и уменьшает обычное значение с базовым step', () => {
    const result = setupControls(10);

    expect(result.canIncrement.value).toBe(true);
    expect(result.increment()).toBe(true);
    expect(result.model.value).toBe(11);

    result.model.value = 10;

    expect(result.canDecrement.value).toBe(true);
    expect(result.decrement()).toBe(true);
    expect(result.model.value).toBe(9);
  });

  it('применяет custom integer step в обе стороны', () => {
    const result = setupControls(10, undefined, undefined, 5);

    expect(result.increment()).toBe(true);
    expect(result.model.value).toBe(15);

    result.model.value = 10;

    expect(result.decrement()).toBe(true);
    expect(result.model.value).toBe(5);
  });

  it('начинает null model со step в разрешённом направлении', () => {
    const result = setupControls(null, undefined, undefined, 3);

    expect(result.canIncrement.value).toBe(true);
    expect(result.increment()).toBe(true);
    expect(result.model.value).toBe(3);

    result.model.value = null;

    expect(result.canDecrement.value).toBe(true);
    expect(result.decrement()).toBe(true);
    expect(result.model.value).toBe(-3);
  });

  it('выбирает ближайшую одностороннюю bound для null model', () => {
    const positive = setupControls(null, 5, 10, 3);

    expect(positive.increment()).toBe(true);
    expect(positive.model.value).toBe(5);
    positive.model.value = null;
    expect(positive.canDecrement.value).toBe(false);
    expect(positive.decrement()).toBe(false);

    const negative = setupControls(null, -10, -5, 3);

    expect(negative.decrement()).toBe(true);
    expect(negative.model.value).toBe(-5);
    negative.model.value = null;
    expect(negative.canIncrement.value).toBe(false);
    expect(negative.increment()).toBe(false);
  });

  it('отключает оба направления для zero-only диапазона', () => {
    const result = setupControls(null, 0, 0);

    expect(result.isBoundsValid.value).toBe(true);
    expect(result.allowsNegative.value).toBe(false);
    expect(result.canIncrement.value).toBe(false);
    expect(result.canDecrement.value).toBe(false);
    expect(result.increment()).toBe(false);
    expect(result.decrement()).toBe(false);
    expect(result.model.value).toBeNull();
  });

  it('соблюдает exact и пересекаемые max boundaries', () => {
    const atMax = setupControls(10, 0, 10, 3);

    expect(atMax.canIncrement.value).toBe(false);
    expect(atMax.increment()).toBe(false);
    expect(atMax.model.value).toBe(10);

    const landsOnMax = setupControls(7, 0, 10, 3);

    expect(landsOnMax.increment()).toBe(true);
    expect(landsOnMax.model.value).toBe(10);

    const crossesMax = setupControls(9, 0, 10, 3);

    expect(crossesMax.increment()).toBe(true);
    expect(crossesMax.model.value).toBe(10);
  });

  it('соблюдает exact и пересекаемые min boundaries', () => {
    const atMin = setupControls(-10, -10, 0, 3);

    expect(atMin.canDecrement.value).toBe(false);
    expect(atMin.decrement()).toBe(false);
    expect(atMin.model.value).toBe(-10);

    const landsOnMin = setupControls(-7, -10, 0, 3);

    expect(landsOnMin.decrement()).toBe(true);
    expect(landsOnMin.model.value).toBe(-10);

    const crossesMin = setupControls(-9, -10, 0, 3);

    expect(crossesMin.decrement()).toBe(true);
    expect(crossesMin.model.value).toBe(-10);
  });

  it('возвращает out-of-bounds model в диапазон только разрешённым направлением', () => {
    const belowMin = setupControls(-5, 0, 10);

    expect(belowMin.canDecrement.value).toBe(false);
    expect(belowMin.decrement()).toBe(false);
    expect(belowMin.increment()).toBe(true);
    expect(belowMin.model.value).toBe(0);

    const aboveMax = setupControls(15, 0, 10);

    expect(aboveMax.canIncrement.value).toBe(false);
    expect(aboveMax.increment()).toBe(false);
    expect(aboveMax.decrement()).toBe(true);
    expect(aboveMax.model.value).toBe(10);
  });

  it.each([
    { value: -1, direction: 'increment', expected: 0 },
    { value: 0, direction: 'decrement', expected: -1 },
    { value: -2, direction: 'increment', expected: 3 },
    { value: 2, direction: 'decrement', expected: -3 },
  ])('пересекает sign boundary: $value $direction → $expected', ({ value, direction, expected }) => {
    const result = setupControls(value, -10, 10, Math.abs(expected - value));
    const changed = direction === 'increment' ? result.increment() : result.decrement();

    expect(changed).toBe(true);
    expect(result.model.value).toBe(expected);
    expect(Object.is(result.model.value, -0)).toBe(false);
  });

  it('не допускает unsafe arithmetic около safe integer boundaries', () => {
    const nearMax = setupControls(Number.MAX_SAFE_INTEGER - 2, undefined, undefined, 5);

    expect(nearMax.increment()).toBe(true);
    expect(nearMax.model.value).toBe(Number.MAX_SAFE_INTEGER);
    expect(Number.isSafeInteger(nearMax.model.value)).toBe(true);

    const nearMin = setupControls(Number.MIN_SAFE_INTEGER + 2, undefined, undefined, 5);

    expect(nearMin.decrement()).toBe(true);
    expect(nearMin.model.value).toBe(Number.MIN_SAFE_INTEGER);
    expect(Number.isSafeInteger(nearMin.model.value)).toBe(true);

    const unsafe = setupControls(Number.MAX_SAFE_INTEGER + 1);

    expect(unsafe.canIncrement.value).toBe(false);
    expect(unsafe.canDecrement.value).toBe(false);
    expect(unsafe.increment()).toBe(false);
    expect(unsafe.decrement()).toBe(false);
  });

  it.each([0, -1, 1.5, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'отключает controls для invalid step %s',
    (step) => {
      const result = setupControls(1, -10, 10, step);

      expect(result.canIncrement.value).toBe(false);
      expect(result.canDecrement.value).toBe(false);
      expect(result.increment()).toBe(false);
      expect(result.decrement()).toBe(false);
      expect(result.model.value).toBe(1);

      const emptyResult = setupControls(null, -10, 10, step);

      expect(emptyResult.canIncrement.value).toBe(false);
      expect(emptyResult.canDecrement.value).toBe(false);
      expect(emptyResult.increment()).toBe(false);
      expect(emptyResult.decrement()).toBe(false);
      expect(emptyResult.model.value).toBeNull();
    },
  );

  it.each([
    { min: 2, max: 1 },
    { min: 1.5, max: 2 },
    { min: 1, max: 2.5 },
    { min: Number.NEGATIVE_INFINITY, max: 2 },
    { min: 1, max: Number.POSITIVE_INFINITY },
  ])('отключает controls для invalid bounds $min…$max', ({ min, max }) => {
    const result = setupControls(1, min, max);

    expect(result.isBoundsValid.value).toBe(false);
    expect(result.allowsNegative.value).toBe(false);
    expect(result.canIncrement.value).toBe(false);
    expect(result.canDecrement.value).toBe(false);
    expect(result.increment()).toBe(false);
    expect(result.decrement()).toBe(false);
  });

  it('реактивно учитывает max, min, step и disabled', () => {
    const result = setupControls(5, 0, 10);

    result.maxSource.value = 4;

    expect(result.max.value).toBe(4);
    expect(result.canIncrement.value).toBe(false);
    expect(result.canDecrement.value).toBe(true);
    expect(result.decrement()).toBe(true);
    expect(result.model.value).toBe(4);

    result.minSource.value = -5;
    result.maxSource.value = 10;
    result.step.value = 3;
    result.model.value = 0;

    expect(result.allowsNegative.value).toBe(true);
    expect(result.increment()).toBe(true);
    expect(result.model.value).toBe(3);

    result.disabled.value = true;

    expect(result.canIncrement.value).toBe(false);
    expect(result.canDecrement.value).toBe(false);
    expect(result.increment()).toBe(false);
    expect(result.decrement()).toBe(false);
    expect(result.model.value).toBe(3);
  });
});
