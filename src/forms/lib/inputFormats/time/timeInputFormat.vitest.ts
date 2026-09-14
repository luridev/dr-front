import { maskitoTransform } from '@maskito/core';
import { describe, expect, it } from 'vitest';
import {
  parseTimeInputValue,
  stringifyTimeInputValue,
  timeInputMaskOptionsBySmallestUnit,
} from '@/forms/lib/inputFormats/time/timeInputFormat';
import type { MaskitoPreprocessor } from '@maskito/core';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

function expectValidTime(source: string, smallestUnit: TimeInputSmallestUnit, expected: string): Temporal.PlainTime {
  const result = parseTimeInputValue(source, smallestUnit);

  expect(result.status).toBe('valid');

  if (result.status !== 'valid') {
    throw new Error(`Expected ${source} to be a valid ${smallestUnit} time`);
  }

  expect(result.value.equals(Temporal.PlainTime.from(expected))).toBe(true);

  return result.value;
}

function preprocessTimeInput(
  elementState: Parameters<MaskitoPreprocessor>[0]['elementState'],
  data: string,
  actionType: Parameters<MaskitoPreprocessor>[1],
  smallestUnit: TimeInputSmallestUnit,
) {
  const preprocessor = timeInputMaskOptionsBySmallestUnit[smallestUnit].preprocessors[0];

  return preprocessor({ elementState, data }, actionType);
}

function insertTimeInput(
  elementState: Parameters<MaskitoPreprocessor>[0]['elementState'],
  data: string,
  smallestUnit: TimeInputSmallestUnit,
): Parameters<MaskitoPreprocessor>[0]['elementState'] {
  const preprocessed = preprocessTimeInput(elementState, data, 'insert', smallestUnit);
  const [from, to] = preprocessed.elementState.selection;
  const insertedData = preprocessed.data ?? data;
  const nextCaretIndex = from + insertedData.length;

  return maskitoTransform(
    {
      value: `${preprocessed.elementState.value.slice(0, from)}${insertedData}${preprocessed.elementState.value.slice(to)}`,
      selection: [nextCaretIndex, nextCaretIndex],
    },
    timeInputMaskOptionsBySmallestUnit[smallestUnit],
  );
}

function deleteTimeInput(
  elementState: Parameters<MaskitoPreprocessor>[0]['elementState'],
  actionType: 'deleteBackward' | 'deleteForward',
  smallestUnit: TimeInputSmallestUnit,
): Parameters<MaskitoPreprocessor>[0]['elementState'] {
  const preprocessed = preprocessTimeInput(elementState, '', actionType, smallestUnit);
  const [from, to] = preprocessed.elementState.selection;

  return maskitoTransform(
    {
      value: `${preprocessed.elementState.value.slice(0, from)}${preprocessed.elementState.value.slice(to)}`,
      selection: [from, from],
    },
    timeInputMaskOptionsBySmallestUnit[smallestUnit],
  );
}

describe('parseTimeInputValue', () => {
  it.each([
    { source: '12:34', smallestUnit: 'minute' as const, expected: '12:34:00' },
    { source: '12:34:56', smallestUnit: 'second' as const, expected: '12:34:56' },
    { source: '12:34:56.123', smallestUnit: 'millisecond' as const, expected: '12:34:56.123' },
    { source: '12:34:56.123456', smallestUnit: 'microsecond' as const, expected: '12:34:56.123456' },
    { source: '12:34:56.123456789', smallestUnit: 'nanosecond' as const, expected: '12:34:56.123456789' },
  ])('разбирает $smallestUnit input $source', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '00:00', smallestUnit: 'minute' as const, expected: '00:00:00' },
    { source: '23:59', smallestUnit: 'minute' as const, expected: '23:59:00' },
    { source: '00:00:00', smallestUnit: 'second' as const, expected: '00:00:00' },
    { source: '23:59:59', smallestUnit: 'second' as const, expected: '23:59:59' },
    { source: '23:59:59.999', smallestUnit: 'millisecond' as const, expected: '23:59:59.999' },
    { source: '23:59:59.999999', smallestUnit: 'microsecond' as const, expected: '23:59:59.999999' },
    { source: '23:59:59.999999999', smallestUnit: 'nanosecond' as const, expected: '23:59:59.999999999' },
  ])('принимает boundary $source для $smallestUnit', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '24:00', smallestUnit: 'minute' as const },
    { source: '00:60', smallestUnit: 'minute' as const },
    { source: '24:00:00', smallestUnit: 'second' as const },
    { source: '00:60:00', smallestUnit: 'second' as const },
    { source: '00:00:60', smallestUnit: 'second' as const },
    { source: '23:59:60.000', smallestUnit: 'millisecond' as const },
    { source: '24:00:00.000000', smallestUnit: 'microsecond' as const },
    { source: '00:60:00.000000000', smallestUnit: 'nanosecond' as const },
  ])('отклоняет time boundary $source для $smallestUnit', ({ source, smallestUnit }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: 'invalid' });
  });

  it.each([
    { source: '12:34', smallestUnit: 'second' as const, expected: '12:34:00' },
    { source: '12:34', smallestUnit: 'millisecond' as const, expected: '12:34:00' },
    { source: '12:34:56', smallestUnit: 'millisecond' as const, expected: '12:34:56' },
    { source: '12:34', smallestUnit: 'microsecond' as const, expected: '12:34:00' },
    { source: '12:34:56', smallestUnit: 'nanosecond' as const, expected: '12:34:56' },
  ])('заполняет нулями отсутствующую меньшую precision в $source', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '12:34:56.1', smallestUnit: 'millisecond' as const, expected: '12:34:56.100' },
    { source: '12:34:56.01', smallestUnit: 'millisecond' as const, expected: '12:34:56.010' },
    { source: '12:34:56.001', smallestUnit: 'millisecond' as const, expected: '12:34:56.001' },
    { source: '12:34:56.120', smallestUnit: 'millisecond' as const, expected: '12:34:56.120' },
    { source: '12:34:56.1234', smallestUnit: 'microsecond' as const, expected: '12:34:56.123400' },
    { source: '12:34:56.123400', smallestUnit: 'microsecond' as const, expected: '12:34:56.123400' },
    { source: '12:34:56.000001', smallestUnit: 'microsecond' as const, expected: '12:34:56.000001' },
    { source: '12:34:56.1234567', smallestUnit: 'nanosecond' as const, expected: '12:34:56.123456700' },
    { source: '12:34:56.000000001', smallestUnit: 'nanosecond' as const, expected: '12:34:56.000000001' },
    { source: '12:34:56.999999999', smallestUnit: 'nanosecond' as const, expected: '12:34:56.999999999' },
  ])('дополняет fraction справа для $smallestUnit input $source', ({ source, smallestUnit, expected }) => {
    expectValidTime(source, smallestUnit, expected);
  });

  it.each([
    { source: '12:34:56.1234', smallestUnit: 'millisecond' as const },
    { source: '12:34:56.1234567', smallestUnit: 'microsecond' as const },
    { source: '12:34:56.1234567890', smallestUnit: 'nanosecond' as const },
  ])('отклоняет fraction длиннее precision для $smallestUnit', ({ source, smallestUnit }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: 'invalid' });
  });

  it.each([
    { source: '', smallestUnit: 'minute' as const, expected: 'empty' },
    { source: '1', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12:', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12:3', smallestUnit: 'minute' as const, expected: 'incomplete' },
    { source: '12:34:', smallestUnit: 'second' as const, expected: 'incomplete' },
    { source: '12:34:5', smallestUnit: 'second' as const, expected: 'incomplete' },
    { source: '12:34:56.', smallestUnit: 'millisecond' as const, expected: 'incomplete' },
    { source: '12:34:56.', smallestUnit: 'microsecond' as const, expected: 'incomplete' },
    { source: '12:34:56.', smallestUnit: 'nanosecond' as const, expected: 'incomplete' },
  ])('возвращает $expected для незавершённого $smallestUnit input $source', ({ source, smallestUnit, expected }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: expected });
  });

  it.each([
    { source: 'a', smallestUnit: 'minute' as const },
    { source: '12:34 ', smallestUnit: 'minute' as const },
    { source: ' 12:34', smallestUnit: 'minute' as const },
    { source: '12/34', smallestUnit: 'minute' as const },
    { source: '123:45', smallestUnit: 'minute' as const },
    { source: '12::34', smallestUnit: 'minute' as const },
    { source: '12:34:56', smallestUnit: 'minute' as const },
    { source: '12:34:56.1', smallestUnit: 'second' as const },
    { source: '12:34:56..1', smallestUnit: 'millisecond' as const },
    { source: '12:34:56.1a', smallestUnit: 'microsecond' as const },
    { source: '12:34:56.123:4', smallestUnit: 'nanosecond' as const },
  ])('отклоняет invalid syntax $source для $smallestUnit', ({ source, smallestUnit }) => {
    expect(parseTimeInputValue(source, smallestUnit)).toEqual({ status: 'invalid' });
  });
});

describe('stringifyTimeInputValue', () => {
  const fullPrecisionValue = Temporal.PlainTime.from('01:02:03.004005006');

  it.each([
    { smallestUnit: 'minute' as const, expected: '01:02' },
    { smallestUnit: 'second' as const, expected: '01:02:03' },
    { smallestUnit: 'millisecond' as const, expected: '01:02:03.004' },
    { smallestUnit: 'microsecond' as const, expected: '01:02:03.004005' },
    { smallestUnit: 'nanosecond' as const, expected: '01:02:03.004005006' },
  ])('форматирует model с precision $smallestUnit как $expected', ({ smallestUnit, expected }) => {
    expect(stringifyTimeInputValue(fullPrecisionValue, smallestUnit)).toBe(expected);
  });

  it('форматирует null как empty string', () => {
    expect(stringifyTimeInputValue(null, 'minute')).toBe('');
  });

  it.each([
    { value: Temporal.PlainTime.from('12:34'), smallestUnit: 'minute' as const },
    { value: Temporal.PlainTime.from('12:34:56'), smallestUnit: 'second' as const },
    { value: Temporal.PlainTime.from('12:34:56.123'), smallestUnit: 'millisecond' as const },
    { value: Temporal.PlainTime.from('12:34:56.123456'), smallestUnit: 'microsecond' as const },
    { value: Temporal.PlainTime.from('12:34:56.123456789'), smallestUnit: 'nanosecond' as const },
  ])('поддерживает round trip для $smallestUnit model $value', ({ value, smallestUnit }) => {
    const result = parseTimeInputValue(stringifyTimeInputValue(value, smallestUnit), smallestUnit);

    expect(result.status).toBe('valid');

    if (result.status === 'valid') {
      expect(result.value.equals(value)).toBe(true);
    }
  });
});

describe('timeInputMaskOptionsBySmallestUnit', () => {
  it.each([
    { data: '12:', expectedData: '12:' },
    { data: ':12', expectedData: '12' },
    { data: '123.', expectedData: '123.' },
    { data: '.123', expectedData: '123' },
    { data: '1:2:3', expectedData: '123' },
  ])('сохраняет только trailing separator во вставке $data', ({ data, expectedData }) => {
    expect(preprocessTimeInput({ value: '', selection: [0, 0] }, data, 'insert', 'nanosecond')).toEqual({
      elementState: {
        value: '',
        selection: [0, 0],
      },
      data: expectedData,
    });
  });

  it('не включает separator в число заменяемых digits', () => {
    expect(preprocessTimeInput({ value: '12:34', selection: [2, 2] }, ':', 'insert', 'minute')).toEqual({
      elementState: {
        value: '12:34',
        selection: [2, 2],
      },
      data: ':',
    });
  });

  it('сохраняет selection при rejected insertion без digits', () => {
    expect(preprocessTimeInput({ value: '12:34', selection: [0, 2] }, 'letters', 'insert', 'minute')).toEqual({
      elementState: {
        value: '12:34',
        selection: [0, 2],
      },
      data: '',
    });
  });

  it.each([
    { selection: [6, 8] as const, data: '5', expectedSelection: [6, 8] as const },
    { selection: [2, 3] as const, data: '12', expectedSelection: [2, 3] as const },
    { selection: [0, 2] as const, data: '5', expectedSelection: [0, 1] as const },
  ])('ограничивает replacement исходным selection $selection', ({ selection, data, expectedSelection }) => {
    expect(preprocessTimeInput({ value: '12:34:56', selection }, data, 'insert', 'second')).toEqual({
      elementState: {
        value: '12:34:56',
        selection: expectedSelection,
      },
      data,
    });
  });

  it('заменяет удаляемые digits нулями и переносит caret в начало selection', () => {
    expect(preprocessTimeInput({ value: '12:34', selection: [1, 2] }, '', 'deleteBackward', 'minute')).toEqual({
      elementState: {
        value: '10:34',
        selection: [1, 1],
      },
      data: '',
    });
  });

  it.each([
    { source: '1234', smallestUnit: 'minute' as const, expected: '12:34' },
    { source: '123456', smallestUnit: 'second' as const, expected: '12:34:56' },
    { source: '123456789', smallestUnit: 'millisecond' as const, expected: '12:34:56.789' },
    { source: '123456123456', smallestUnit: 'microsecond' as const, expected: '12:34:56.123456' },
    { source: '123456123456789', smallestUnit: 'nanosecond' as const, expected: '12:34:56.123456789' },
  ])('вставляет структуру $smallestUnit в whole value $source', ({ source, smallestUnit, expected }) => {
    expect(maskitoTransform(source, timeInputMaskOptionsBySmallestUnit[smallestUnit])).toBe(expected);
  });

  it.each([
    { source: '1', expected: '1' },
    { source: '123', expected: '12:3' },
    { source: '12345', expected: '12:34:5' },
    { source: '1234561', expected: '12:34:56.1' },
  ])('сохраняет incomplete nanosecond input $source', ({ source, expected }) => {
    expect(maskitoTransform(source, timeInputMaskOptionsBySmallestUnit.nanosecond)).toBe(expected);
  });

  it.each([
    { data: '12/34', smallestUnit: 'minute' as const, expected: '12:34' },
    { data: '12:34:56', smallestUnit: 'second' as const, expected: '12:34:56' },
    { data: '12:34:56.123', smallestUnit: 'millisecond' as const, expected: '12:34:56.123' },
    { data: '12:34:56.123456', smallestUnit: 'microsecond' as const, expected: '12:34:56.123456' },
    { data: '12:34:56.123456789', smallestUnit: 'nanosecond' as const, expected: '12:34:56.123456789' },
  ])('нормализует paste $data для $smallestUnit', ({ data, smallestUnit, expected }) => {
    expect(insertTimeInput({ value: '', selection: [0, 0] }, data, smallestUnit).value).toBe(expected);
  });

  it('сохраняет trailing separators при вводе следующего segment', () => {
    expect(insertTimeInput({ value: '12', selection: [2, 2] }, ':', 'second').value).toBe('12:');
    expect(insertTimeInput({ value: '12:34:56', selection: [8, 8] }, '.', 'millisecond').value).toBe('12:34:56.');
  });

  it.each(['letters', ' / '])('не меняет значение при вставке без digits: %j', (data) => {
    expect(insertTimeInput({ value: '12:34', selection: [0, 0] }, data, 'minute').value).toBe('12:34');
  });

  it.each([
    { selection: [0, 0] as const, data: '23', expected: '23:34:56.123456789' },
    { selection: [3, 3] as const, data: '59', expected: '12:59:56.123456789' },
    { selection: [6, 6] as const, data: '60', expected: '12:34:60.123456789' },
    { selection: [9, 9] as const, data: '999', expected: '12:34:56.999456789' },
    { selection: [15, 15] as const, data: '000', expected: '12:34:56.123456000' },
  ])('заменяет segment из позиции $selection', ({ selection, data, expected }) => {
    expect(insertTimeInput({ value: '12:34:56.123456789', selection }, data, 'nanosecond').value).toBe(expected);
  });

  it('сохраняет временно invalid hour/minute/second без clamp', () => {
    const invalidValues = [
      insertTimeInput({ value: '12:34:56', selection: [0, 2] }, '24', 'second').value,
      insertTimeInput({ value: '12:34:56', selection: [3, 5] }, '60', 'second').value,
      insertTimeInput({ value: '12:34:56', selection: [6, 8] }, '60', 'second').value,
    ];

    expect(invalidValues).toEqual(['24:34:56', '12:60:56', '12:34:60']);

    invalidValues.forEach((value) => {
      expect(parseTimeInputValue(value, 'second')).toEqual({ status: 'invalid' });
    });
  });

  it.each([
    { selection: [0, 0] as const, data: '23', expectedSelection: [0, 2] as const },
    { selection: [3, 3] as const, data: '5', expectedSelection: [3, 4] as const },
    { selection: [6, 6] as const, data: '12a3', expectedSelection: [6, 10] as const },
    { selection: [2, 3] as const, data: '5', expectedSelection: [2, 2] as const },
  ])('выбирает digits для replacement из позиции $selection', ({ selection, data, expectedSelection }) => {
    expect(preprocessTimeInput({ value: '12:34:56.123', selection }, data, 'insert', 'millisecond')).toEqual({
      elementState: {
        value: '12:34:56.123',
        selection: expectedSelection,
      },
      data: data.replaceAll(/\D/g, ''),
    });
  });

  it.each([
    { actionType: 'deleteBackward' as const, selection: [1, 2] as const, expected: '10:34:56.123' },
    { actionType: 'deleteForward' as const, selection: [3, 5] as const, expected: '12:00:56.123' },
    { actionType: 'deleteBackward' as const, selection: [9, 11] as const, expected: '12:34:56.003' },
  ])('заменяет удаляемые digits нулями для $actionType', ({ actionType, selection, expected }) => {
    expect(deleteTimeInput({ value: '12:34:56.123', selection }, actionType, 'millisecond').value).toBe(expected);
  });

  it('оставляет fixed separator при deletion', () => {
    expect(deleteTimeInput({ value: '12:34:56.123', selection: [2, 3] }, 'deleteForward', 'millisecond').value).toBe(
      '12:34:56.123',
    );

    expect(deleteTimeInput({ value: '12:34:56.123', selection: [8, 9] }, 'deleteBackward', 'millisecond').value).toBe(
      '12:34:56.123',
    );
  });

  it('позволяет удалить fraction до incomplete separator', () => {
    expect(deleteTimeInput({ value: '12:34:56.123', selection: [9, 12] }, 'deleteBackward', 'millisecond').value).toBe(
      '12:34:56.',
    );
  });

  it('позволяет удалить time value целиком', () => {
    expect(deleteTimeInput({ value: '12:34', selection: [0, 5] }, 'deleteBackward', 'minute').value).toBe('');
  });
});
