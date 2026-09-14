import { afterEach, describe, expect, it, vi } from 'vitest';
import { customRef, nextTick, ref } from 'vue';
import { useDrTypedInputModel } from '@/forms/components/DrInput/composables/useDrTypedInputModel/useDrTypedInputModel';
import { parseTimeInputValue, stringifyTimeInputValue } from '@/forms/lib/inputFormats/time/timeInputFormat';
import { createTestEffectScopeCollector } from '~/tests/vitest/lib/createTestEffectScopeCollector/createTestEffectScopeCollector';
import type * as Vue from 'vue';
import type { ModelRef } from 'vue';
import type {
  DrTypedInputParseResult,
  DrTypedInputStatus,
} from '@/forms/components/DrInput/composables/useDrTypedInputModel/types';

const { mountedCallbacks } = vi.hoisted(() => ({
  mountedCallbacks: new Array<() => void>(),
}));

vi.mock('vue', async (importOriginal) => {
  const vue = await importOriginal<typeof Vue>();

  return {
    ...vue,
    onMounted: (callback: () => void) => {
      mountedCallbacks.push(callback);
    },
  };
});

const scopes = createTestEffectScopeCollector();

afterEach(() => {
  mountedCallbacks.splice(0);
});

function mountComposable(): void {
  const callback = mountedCallbacks.shift();

  if (callback == null) {
    throw new Error('Expected composable to register an onMounted callback');
  }

  callback();
}

function createModel<TValue>(value: TValue | null): ModelRef<TValue | null> {
  return ref(value) as ModelRef<TValue | null>;
}

function createControlledModel(value: number | null, acceptWrites: boolean) {
  let currentValue = value;
  let notify: () => void = () => undefined;
  const requestedValues: Array<number | null> = [];

  const model = customRef<number | null>((track, trigger) => {
    notify = trigger;

    return {
      get() {
        track();

        return currentValue;
      },
      set(nextValue) {
        requestedValues.push(nextValue);

        if (acceptWrites) {
          currentValue = nextValue;
          trigger();
        }
      },
    };
  }) as ModelRef<number | null>;

  function updateExternal(nextValue: number | null): void {
    currentValue = nextValue;
    notify();
  }

  return {
    model,
    requestedValues,
    updateExternal,
  };
}

function parseTestInput(value: string): DrTypedInputParseResult<number, 'out-of-range'> {
  if (value === '') {
    return { status: 'empty' };
  }

  if (value === 'pending') {
    return { status: 'incomplete' };
  }

  if (value === 'out-of-range') {
    return { status: 'out-of-range' };
  }

  const match = /^value:(-?\d+)$/.exec(value);

  return match == null
    ? { status: 'invalid' }
    : {
        status: 'valid',
        value: Number(match[1]),
      };
}

function setupWithModel(model: ModelRef<number | null>, initialFormat = 'A', mount = true) {
  const formatSource = ref(initialFormat);
  const statuses: Array<DrTypedInputStatus | 'out-of-range'> = [];
  const parse = vi.fn(parseTestInput);

  const stringify = vi.fn((nextValue: number | null) =>
    nextValue == null ? '' : `${formatSource.value}:${nextValue}`,
  );

  const equals = vi.fn((first: number, second: number) => first.valueOf() === second.valueOf());

  const result = scopes.run(() =>
    useDrTypedInputModel<number, 'out-of-range', string>({
      model,
      formatSource,
      parse,
      stringify,
      equals,
      onStatusUpdate: (status) => {
        statuses.push(status);
      },
    }),
  );

  if (mount) {
    mountComposable();
  }

  return {
    ...result,
    model,
    formatSource,
    statuses,
    parse,
    stringify,
    equals,
  };
}

function setupModel(value: number | null, initialFormat = 'A', mount = true) {
  return setupWithModel(createModel(value), initialFormat, mount);
}

describe('useDrTypedInputModel', () => {
  it('не эмитит status до mount и публикует последнее состояние при mount', () => {
    const result = setupModel(null, 'A', false);

    expect(result.statuses).toEqual([]);

    result.updateInputValue('pending');

    expect(result.statuses).toEqual([]);

    mountComposable();

    expect(result.statuses).toEqual(['incomplete']);
  });

  it.each([
    { modelValue: null, expectedInput: '', expectedStatus: 'empty' },
    { modelValue: 7, expectedInput: 'A:7', expectedStatus: 'valid' },
  ] as const)('инициализирует model $modelValue', ({ modelValue, expectedInput, expectedStatus }) => {
    const result = setupModel(modelValue);

    expect(result.inputValue.value).toBe(expectedInput);
    expect(result.statuses).toEqual([expectedStatus]);
  });

  it.each([
    { source: 'value:42', expectedModel: 42, expectedStatus: 'valid' },
    { source: '', expectedModel: null, expectedStatus: 'empty' },
    { source: 'pending', expectedModel: null, expectedStatus: 'incomplete' },
    { source: 'invalid', expectedModel: null, expectedStatus: 'invalid' },
    { source: 'out-of-range', expectedModel: null, expectedStatus: 'out-of-range' },
  ] as const)('применяет пользовательский input $source', ({ source, expectedModel, expectedStatus }) => {
    const result = setupModel(7);

    result.updateInputValue(source);

    expect(result.inputValue.value).toBe(source);
    expect(result.model.value).toBe(expectedModel);
    expect(result.statuses.at(-1)).toBe(expectedStatus);
  });

  it.each(['pending', 'invalid', 'out-of-range'] as const)(
    'сохраняет pending текст $source после model watcher',
    async (source) => {
      const result = setupModel(7);

      result.updateInputValue(source);
      await nextTick();

      expect(result.model.value).toBeNull();
      expect(result.inputValue.value).toBe(source);
      expect(result.statuses.at(-1)).toBe(source === 'pending' ? 'incomplete' : source);
    },
  );

  it('не форматирует обратно собственный valid update после nextTick', async () => {
    const result = setupModel(1);

    result.updateInputValue('value:007');

    expect(result.model.value).toBe(7);
    expect(result.inputValue.value).toBe('value:007');

    await nextTick();

    expect(result.model.value).toBe(7);
    expect(result.inputValue.value).toBe('value:007');
  });

  it('сохраняет последний из нескольких собственных updates одного tick', async () => {
    const result = setupModel(0);

    result.updateInputValue('value:1');
    result.updateInputValue('value:002');
    await nextTick();

    expect(result.model.value).toBe(2);
    expect(result.inputValue.value).toBe('value:002');
    expect(result.statuses).toEqual(['valid']);
  });

  it('очищает pending request, если ModelRef отложил его применение', async () => {
    const controlledModel = createControlledModel(1, false);
    const result = setupWithModel(controlledModel.model);

    result.updateInputValue('value:002');

    expect(controlledModel.requestedValues).toEqual([2]);
    expect(result.model.value).toBe(1);
    expect(result.inputValue.value).toBe('value:002');

    await nextTick();

    controlledModel.updateExternal(2);
    await nextTick();

    expect(result.model.value).toBe(2);
    expect(result.inputValue.value).toBe('A:2');
  });

  it('синхронизирует повторно опубликованное собственное значение после cleanup', async () => {
    const controlledModel = createControlledModel(1, true);
    const result = setupWithModel(controlledModel.model);

    result.updateInputValue('value:002');
    await nextTick();

    expect(result.inputValue.value).toBe('value:002');

    controlledModel.updateExternal(2);
    await nextTick();

    expect(result.inputValue.value).toBe('A:2');
  });

  it('не создаёт pending update для эквивалентного model value', async () => {
    const result = setupModel(7);

    result.updateInputValue('value:007');
    result.model.value = 8;
    await nextTick();

    expect(result.inputValue.value).toBe('A:8');
    expect(result.statuses).toEqual(['valid']);
  });

  it('синхронизирует внешние переходы value → value → null → value', async () => {
    const result = setupModel(1);

    result.model.value = 2;
    await nextTick();
    expect(result.inputValue.value).toBe('A:2');

    result.model.value = null;
    await nextTick();
    expect(result.inputValue.value).toBe('');

    result.model.value = 3;
    await nextTick();
    expect(result.inputValue.value).toBe('A:3');
    expect(result.statuses).toEqual(['valid', 'empty', 'valid']);
  });

  it('внешний update перебивает pending пользовательский текст', async () => {
    const result = setupModel(1);

    result.updateInputValue('pending');
    result.model.value = 9;
    await nextTick();

    expect(result.model.value).toBe(9);
    expect(result.inputValue.value).toBe('A:9');
    expect(result.statuses).toEqual(['valid', 'incomplete', 'valid']);
  });

  it('внешний null перебивает pending valid пользовательский текст', async () => {
    const result = setupModel(1);

    result.updateInputValue('value:2');
    result.model.value = null;
    await nextTick();

    expect(result.model.value).toBeNull();
    expect(result.inputValue.value).toBe('');
    expect(result.statuses).toEqual(['valid', 'empty']);
  });

  it('смена format dependency канонизирует собственный valid input', async () => {
    const result = setupModel(1);

    result.updateInputValue('value:002');
    result.formatSource.value = 'B';
    await nextTick();

    expect(result.model.value).toBe(2);
    expect(result.inputValue.value).toBe('B:2');
    expect(result.statuses).toEqual(['valid']);
  });

  it('смена format dependency сбрасывает invalid pending input', async () => {
    const result = setupModel(1);

    result.updateInputValue('invalid');
    result.formatSource.value = 'B';
    await nextTick();

    expect(result.model.value).toBeNull();
    expect(result.inputValue.value).toBe('');
    expect(result.statuses).toEqual(['valid', 'invalid', 'empty']);
  });

  it('после смены format dependency принимает внешний переход model в null', async () => {
    const result = setupModel(1);

    result.formatSource.value = 'B';
    await nextTick();

    expect(result.inputValue.value).toBe('B:1');

    result.model.value = null;
    await nextTick();

    expect(result.inputValue.value).toBe('');
    expect(result.statuses).toEqual(['valid', 'empty']);
  });

  it('обрабатывает одновременную смену внешней model и format dependency', async () => {
    const result = setupModel(1);

    result.updateInputValue('pending');
    result.model.value = 5;
    result.formatSource.value = 'B';
    await nextTick();

    expect(result.inputValue.value).toBe('B:5');
    expect(result.statuses).toEqual(['valid', 'incomplete', 'valid']);
  });

  it('эмитит только фактические изменения status', () => {
    const result = setupModel(null);

    result.updateInputValue('pending');
    result.updateInputValue('pending');
    result.updateInputValue('value:1');
    result.updateInputValue('value:2');
    result.updateInputValue('invalid');
    result.updateInputValue('invalid');
    result.updateInputValue('value:3');

    expect(result.statuses).toEqual(['empty', 'incomplete', 'valid', 'invalid', 'valid']);
  });

  it('интегрируется с реальным time format interface', async () => {
    const initialValue = Temporal.PlainTime.from('12:34');
    const model = createModel(initialValue);
    const statuses: Array<DrTypedInputStatus> = [];

    const result = scopes.run(() =>
      useDrTypedInputModel<Temporal.PlainTime>({
        model,
        parse: (value) => parseTimeInputValue(value, 'minute'),
        stringify: (value) => stringifyTimeInputValue(value, 'minute'),
        equals: (first, second) => first.equals(second),
        onStatusUpdate: (status) => {
          statuses.push(status);
        },
      }),
    );

    mountComposable();

    expect(result.inputValue.value).toBe('12:34');

    result.updateInputValue('12:34');

    expect(model.value).toBe(initialValue);

    result.updateInputValue('23:59');
    await nextTick();

    expect(model.value?.equals(Temporal.PlainTime.from('23:59'))).toBe(true);
    expect(result.inputValue.value).toBe('23:59');
    expect(statuses).toEqual(['valid']);
  });
});
