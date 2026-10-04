import { maskitoTransform } from '@maskito/core';
import { describe, expect, it, vi } from 'vitest';
import { getTemporalPlainDateMax, getTemporalPlainDateMin } from '@/forms/lib/inputFormats/date/config';
import {
  dateInputMaskOptions,
  parseDateInputValue,
  stringifyDateInputValue,
} from '@/forms/lib/inputFormats/date/dateInputFormat';
import type { MaskitoPreprocessor } from '@maskito/core';

const dateInputPreprocessor = dateInputMaskOptions.preprocessors[0];

it('loads the date input format without a global Temporal', async () => {
  vi.resetModules();
  vi.stubGlobal('Temporal', undefined);

  try {
    await expect(import('@/forms/lib/inputFormats/date/dateInputFormat')).resolves.toBeDefined();
  } finally {
    vi.unstubAllGlobals();
  }
});

function expectValidDate(source: string, expected: string): Temporal.PlainDate {
  const result = parseDateInputValue(source);

  expect(result.status).toBe('valid');

  if (result.status !== 'valid') {
    throw new Error(`Expected ${source} to be a valid date`);
  }

  expect(result.value.equals(Temporal.PlainDate.from(expected))).toBe(true);

  return result.value;
}

function preprocessDateInput(
  elementState: Parameters<MaskitoPreprocessor>[0]['elementState'],
  data: string,
  actionType: Parameters<MaskitoPreprocessor>[1],
) {
  return dateInputPreprocessor({ elementState, data }, actionType);
}

function insertDateInput(
  elementState: Parameters<MaskitoPreprocessor>[0]['elementState'],
  data: string,
): Parameters<MaskitoPreprocessor>[0]['elementState'] {
  const preprocessed = preprocessDateInput(elementState, data, 'insert');
  const [from, to] = preprocessed.elementState.selection;
  const insertedData = preprocessed.data ?? data;
  const nextCaretIndex = from + insertedData.length;

  return maskitoTransform(
    {
      value: `${preprocessed.elementState.value.slice(0, from)}${insertedData}${preprocessed.elementState.value.slice(to)}`,
      selection: [nextCaretIndex, nextCaretIndex],
    },
    dateInputMaskOptions,
  );
}

function deleteDateInput(
  elementState: Parameters<MaskitoPreprocessor>[0]['elementState'],
  actionType: 'deleteBackward' | 'deleteForward',
): Parameters<MaskitoPreprocessor>[0]['elementState'] {
  const preprocessed = preprocessDateInput(elementState, '', actionType);
  const [from, to] = preprocessed.elementState.selection;

  return maskitoTransform(
    {
      value: `${preprocessed.elementState.value.slice(0, from)}${preprocessed.elementState.value.slice(to)}`,
      selection: [from, from],
    },
    dateInputMaskOptions,
  );
}

describe('parseDateInputValue', () => {
  it.each([
    { source: '01.01.2026', expected: '2026-01-01' },
    { source: '19.08.2026', expected: '2026-08-19' },
    { source: '31.12.2026', expected: '2026-12-31' },
    { source: '31.01.2026', expected: '2026-01-31' },
    { source: '30.04.2026', expected: '2026-04-30' },
    { source: '30.06.2026', expected: '2026-06-30' },
    { source: '28.02.2026', expected: '2026-02-28' },
  ])('parses calendar date $source', ({ source, expected }) => {
    expectValidDate(source, expected);
  });

  it.each([
    { source: '29.02.2024', expected: '2024-02-29' },
    { source: '29.02.2000', expected: '2000-02-29' },
  ])('accepts February 29 in a leap year: $source', ({ source, expected }) => {
    expectValidDate(source, expected);
  });

  it.each(['29.02.2023', '29.02.1900'])('rejects February 29 in a non-leap year: %s', (source) => {
    expect(parseDateInputValue(source)).toEqual({ status: 'invalid' });
  });

  it.each([
    '00.01.2026',
    '32.01.2026',
    '01.00.2026',
    '01.13.2026',
    '31.04.2026',
    '31.06.2026',
    '30.02.2026',
    '31.02.999999',
  ])('rejects nonexistent calendar dates: %s', (source) => {
    expect(parseDateInputValue(source)).toEqual({ status: 'invalid' });
  });

  it.each(['', '1', '01', '01.', '01.0', '01.01', '01.01.', '01.01.-'])(
    'distinguishes empty and incomplete input %j',
    (source) => {
      expect(parseDateInputValue(source)).toEqual({
        status: source === '' ? 'empty' : 'incomplete',
      });
    },
  );

  it.each([
    'a',
    '01.01.2026 ',
    ' 01.01.2026',
    '1.01.2026',
    '01.1.2026',
    '01/01/2026',
    '01..01.2026',
    '01.01..2026',
    '01.01.20a6',
    '01.01.+2026',
    '01.01.--1',
    '01.01.1234567',
    '01.01.2026.1',
  ])('rejects invalid syntax %j', (source) => {
    expect(parseDateInputValue(source)).toEqual({ status: 'invalid' });
  });

  it.each([
    { source: '01.01.0', expected: '0000-01-01' },
    { source: '01.01.-0', expected: '0000-01-01' },
    { source: '01.01.1', expected: '0001-01-01' },
    { source: '01.01.000001', expected: '0001-01-01' },
    { source: '01.03.-1', expected: '-000001-03-01' },
    { source: '01.01.10000', expected: '+010000-01-01' },
    { source: '01.01.-10000', expected: '-010000-01-01' },
  ])('supports extended year semantics for $source', ({ source, expected }) => {
    expectValidDate(source, expected);
  });

  it('accepts both boundaries of the Temporal.PlainDate range', () => {
    expectValidDate('19.04.-271821', getTemporalPlainDateMin().toString());
    expectValidDate('13.09.275760', getTemporalPlainDateMax().toString());
  });

  it.each([
    '31.12.-271822',
    '01.03.-271821',
    '18.04.-271821',
    '14.09.275760',
    '01.10.275760',
    '01.01.275761',
    '01.01.-999999',
    '01.01.999999',
  ])('returns out-of-range beyond Temporal boundaries: %s', (source) => {
    expect(parseDateInputValue(source)).toEqual({ status: 'out-of-range' });
  });
});

describe('stringifyDateInputValue', () => {
  it.each([
    { value: null, expected: '' },
    { value: Temporal.PlainDate.from('2026-08-19'), expected: '19.08.2026' },
    { value: Temporal.PlainDate.from('0000-01-01'), expected: '01.01.0000' },
    { value: Temporal.PlainDate.from('0001-01-01'), expected: '01.01.0001' },
    { value: Temporal.PlainDate.from('-000001-03-01'), expected: '01.03.-0001' },
    { value: Temporal.PlainDate.from('+010000-01-01'), expected: '01.01.10000' },
    { value: getTemporalPlainDateMin(), expected: '19.04.-271821' },
    { value: getTemporalPlainDateMax(), expected: '13.09.275760' },
  ])('formats the model date as $expected', ({ value, expected }) => {
    expect(stringifyDateInputValue(value)).toBe(expected);
  });

  it.each([
    Temporal.PlainDate.from('2026-01-01'),
    Temporal.PlainDate.from('2024-02-29'),
    Temporal.PlainDate.from('0000-12-31'),
    Temporal.PlainDate.from('-000001-03-01'),
    Temporal.PlainDate.from('+010000-01-01'),
    getTemporalPlainDateMin(),
    getTemporalPlainDateMax(),
  ])('supports round trips for $value', (value) => {
    const result = parseDateInputValue(stringifyDateInputValue(value));

    expect(result.status).toBe('valid');

    if (result.status === 'valid') {
      expect(result.value.equals(value)).toBe(true);
    }
  });
});

describe('dateInputMaskOptions', () => {
  it.each([
    { value: '01', selection: [2, 2] as const },
    { value: '01.01', selection: [5, 5] as const },
    { value: '01.01.2026', selection: [2, 2] as const },
    { value: '01.01.2026', selection: [5, 5] as const },
  ])('preserves a manually entered separator at $selection', ({ value, selection }) => {
    expect(preprocessDateInput({ value, selection }, '.', 'insert')).toEqual({
      elementState: { value, selection },
      data: '.',
    });
  });

  it.each([
    { value: '01.01.2026', selection: [1, 1] as const, data: '.' },
    { value: '01.01.2026', selection: [2, 3] as const, data: '.' },
    { value: '0', selection: [2, 2] as const, data: '.' },
    { value: '01.01.2026', selection: [2, 2] as const, data: ',' },
  ])('rejects separator $data outside a valid transition at $selection', ({ value, selection, data }) => {
    expect(preprocessDateInput({ value, selection }, data, 'insert')).toEqual({
      elementState: { value, selection },
      data: '',
    });
  });

  it('inserts the year separator before a minus sign entered after the month', () => {
    expect(preprocessDateInput({ value: '01.01', selection: [5, 5] }, '-', 'insert')).toEqual({
      elementState: {
        value: '01.01.',
        selection: [6, 6],
      },
      data: '-',
    });
  });

  it('preserves the minus sign position in a year segment already started', () => {
    expect(preprocessDateInput({ value: '01.01.', selection: [6, 6] }, '-', 'insert')).toEqual({
      elementState: {
        value: '01.01.',
        selection: [6, 6],
      },
      data: '-',
    });
  });

  it.each([
    { value: 'x01.01', selection: [5, 5] as const },
    { value: '01.01x', selection: [5, 5] as const },
    { value: '01.01', selection: [4, 4] as const },
  ])('rejects $value that only resembles a pending year', ({ value, selection }) => {
    expect(preprocessDateInput({ value, selection }, '-', 'insert')).toEqual({
      elementState: { value, selection },
      data: '',
    });
  });

  it.each([
    { value: '', selection: [0, 0] as const, data: '-01012026' },
    { value: '', selection: [0, 0] as const, data: '01-012026' },
    { value: '', selection: [0, 0] as const, data: '0101--2026' },
    { value: '01.01.2026', selection: [3, 3] as const, data: '-' },
    { value: '01.01', selection: [5, 5] as const, data: '2026-' },
    { value: '01.01.', selection: [6, 6] as const, data: '2026-' },
  ])('clears inserted data with a minus sign outside the year start: $data', ({ value, selection, data }) => {
    expect(preprocessDateInput({ value, selection }, data, 'insert')).toEqual({
      elementState: { value, selection },
      data: '',
    });
  });

  it('skips minus preprocessing for a digit in a pending year segment', () => {
    expect(preprocessDateInput({ value: '01.01', selection: [5, 5] }, '2', 'insert')).toEqual({
      elementState: {
        value: '01.01',
        selection: [5, 5],
      },
      data: '2',
    });
  });

  it.each([
    { selection: [0, 0] as const, data: '29', expectedSelection: [0, 2] as const },
    { selection: [1, 1] as const, data: '5', expectedSelection: [1, 2] as const },
    { selection: [4, 4] as const, data: '2', expectedSelection: [4, 5] as const },
    { selection: [6, 6] as const, data: '2024', expectedSelection: [6, 10] as const },
    { selection: [4, 4] as const, data: '2a0', expectedSelection: [4, 7] as const },
  ])('selects editable characters for replacement from $selection', ({ selection, data, expectedSelection }) => {
    expect(preprocessDateInput({ value: '31.01.2026', selection }, data, 'insert')).toEqual({
      elementState: {
        value: '31.01.2026',
        selection: expectedSelection,
      },
      data: data.replaceAll(/[^0-9-]/g, ''),
    });
  });

  it.each([
    { value: '31.01.2026', selection: [4, 5] as const, data: '12' },
    { value: '31.01.-2026', selection: [6, 7] as const, data: '2' },
    { value: '31.01.2026', selection: [9, 10] as const, data: '7' },
  ])('preserves explicit selection $selection during replacement', ({ value, selection, data }) => {
    expect(preprocessDateInput({ value, selection }, data, 'insert')).toEqual({
      elementState: { value, selection },
      data,
    });
  });

  it.each([
    { value: '31.01.2026', selection: [2, 3] as const, data: '5', expectedSelection: [2, 2] as const },
    { value: '31.01.2026', selection: [2, 3] as const, data: '12', expectedSelection: [2, 3] as const },
    { value: '31.01.-2026', selection: [0, 2] as const, data: '2', expectedSelection: [0, 1] as const },
    { value: '31.01.-2026', selection: [6, 8] as const, data: '2', expectedSelection: [6, 8] as const },
    { value: '31.01.2026', selection: [8, 10] as const, data: '7', expectedSelection: [8, 10] as const },
  ])('limits replacement to the original selection $selection', ({ value, selection, data, expectedSelection }) => {
    expect(preprocessDateInput({ value, selection }, data, 'insert')).toEqual({
      elementState: {
        value,
        selection: expectedSelection,
      },
      data,
    });
  });

  it.each(['validation', 'deleteBackward', 'deleteForward'] as const)(
    'skips insert preprocessing for empty input during $actionType',
    (actionType) => {
      expect(preprocessDateInput({ value: '', selection: [0, 0] }, '', actionType)).toEqual({
        elementState: { value: '', selection: [0, 0] },
        data: '',
      });
    },
  );

  it.each([
    { actionType: 'deleteBackward' as const, selection: [1, 2] as const, expected: '10.08.2026' },
    { actionType: 'deleteForward' as const, selection: [0, 1] as const, expected: '09.08.2026' },
    { actionType: 'deleteBackward' as const, selection: [0, 5] as const, expected: '00.00.2026' },
  ])('replaces selected digits with zeros for $actionType', ({ actionType, selection, expected }) => {
    expect(preprocessDateInput({ value: '19.08.2026', selection }, '', actionType)).toEqual({
      elementState: {
        value: expected,
        selection: [selection[0], selection[0]],
      },
      data: '',
    });
  });

  it.each([
    { value: '19.08.2026', selection: [2, 3] as const },
    { value: '01.01.-2026', selection: [6, 7] as const },
    { value: '19.08.2026', selection: [0, 10] as const },
  ])('does not substitute zeros for special deletion $selection', ({ value, selection }) => {
    expect(preprocessDateInput({ value, selection }, '', 'deleteForward')).toEqual({
      elementState: { value, selection },
      data: '',
    });
  });

  it.each([
    { source: '1', expected: '1' },
    { source: '010', expected: '01.0' },
    { source: '0101', expected: '01.01' },
    { source: '01012026', expected: '01.01.2026' },
    { source: '0101-2026', expected: '01.01.-2026' },
  ])('inserts separators when transforming the whole value $source', ({ source, expected }) => {
    expect(maskitoTransform(source, dateInputMaskOptions)).toBe(expected);
  });

  it.each([
    { data: '31/12/2026', expected: '31.12.2026' },
    { data: '29-02-2024', expected: '' },
    { data: '01.01.-2026', expected: '01.01.-2026' },
  ])('normalizes a pasted full date $data', ({ data, expected }) => {
    expect(insertDateInput({ value: '', selection: [0, 0] }, data).value).toBe(expected);
  });

  it.each(['letters', '...', ' / '])('preserves the value for insertions without editable characters: %j', (data) => {
    expect(insertDateInput({ value: '19.08.2026', selection: [0, 0] }, data).value).toBe('19.08.2026');
  });

  it('does not duplicate user-entered separators', () => {
    expect(insertDateInput({ value: '01.01.2026', selection: [2, 2] }, '.').value).toBe('01.01.2026');
    expect(insertDateInput({ value: '01.01.2026', selection: [5, 5] }, '.').value).toBe('01.01.2026');
  });

  it('rejects a separator at an editable character position', () => {
    expect(insertDateInput({ value: '01.01.2026', selection: [1, 1] }, '.').value).toBe('01.01.2026');
  });

  it.each([
    { value: '01.01', selection: [5, 5] as const },
    { value: '01.01.', selection: [6, 6] as const },
  ])('adds a minus sign at the year start for $value', ({ value, selection }) => {
    expect(insertDateInput({ value, selection }, '-').value).toBe('01.01.-');
  });

  it.each([
    { value: '', selection: [0, 0] as const, data: '-01012026' },
    { value: '', selection: [0, 0] as const, data: '01-012026' },
    { value: '', selection: [0, 0] as const, data: '0101--2026' },
    { value: '01.01.2026', selection: [3, 3] as const, data: '-' },
  ])('rejects a minus sign outside the year start: $data', ({ value, selection, data }) => {
    expect(insertDateInput({ value, selection }, data).value).toBe(value);
  });

  it('replaces a selected positive-year date with a negative-year date on paste', () => {
    expect(insertDateInput({ value: '19.08.2026', selection: [0, 10] }, '0101-44').value).toBe('01.01.-44');
  });

  it('replaces a negative year with a positive year on paste', () => {
    expect(insertDateInput({ value: '01.01.-2026', selection: [6, 11] }, '44').value).toBe('01.01.44');
  });

  it.each([
    { selection: [0, 0] as const, data: '29', expected: '29.01.2026' },
    { selection: [1, 1] as const, data: '5', expected: '35.01.2026' },
    { selection: [4, 4] as const, data: '2', expected: '31.02.2026' },
    { selection: [6, 6] as const, data: '2024', expected: '31.01.2024' },
    { selection: [9, 9] as const, data: '7', expected: '31.01.2027' },
  ])('replaces editable characters of an existing date from $selection', ({ selection, data, expected }) => {
    expect(insertDateInput({ value: '31.01.2026', selection }, data).value).toBe(expected);
  });

  it('preserves a temporarily invalid date when changing the month', () => {
    const edited = insertDateInput({ value: '31.01.2026', selection: [4, 5] }, '2').value;

    expect(edited).toBe('31.02.2026');
    expect(parseDateInputValue(edited)).toEqual({ status: 'invalid' });
  });

  it('preserves a temporarily invalid date when changing the leap year', () => {
    const edited = insertDateInput({ value: '29.02.2024', selection: [6, 10] }, '2023').value;

    expect(edited).toBe('29.02.2023');
    expect(parseDateInputValue(edited)).toEqual({ status: 'invalid' });
  });

  it('appends data to incomplete input', () => {
    expect(insertDateInput({ value: '01.01.20', selection: [8, 8] }, '26').value).toBe('01.01.2026');
  });

  it.each([
    { actionType: 'deleteBackward' as const, selection: [1, 2] as const, expected: '10.08.2026' },
    { actionType: 'deleteForward' as const, selection: [0, 1] as const, expected: '09.08.2026' },
  ])('replaces the deleted digit with zero for $actionType', ({ actionType, selection, expected }) => {
    expect(deleteDateInput({ value: '19.08.2026', selection }, actionType).value).toBe(expected);
  });

  it('replaces multiple deleted segments with zeros while preserving the separator', () => {
    expect(deleteDateInput({ value: '19.08.2026', selection: [0, 5] }, 'deleteBackward').value).toBe('00.00.2026');
  });

  it('leaves separator-only deletion to Maskito', () => {
    expect(deleteDateInput({ value: '19.08.2026', selection: [2, 3] }, 'deleteForward').value).toBe('19.08.2026');
  });

  it('allows deleting the minus sign from a negative year', () => {
    expect(deleteDateInput({ value: '01.01.-2026', selection: [6, 7] }, 'deleteForward').value).toBe('01.01.2026');
  });

  it('allows deleting the entire value', () => {
    expect(deleteDateInput({ value: '19.08.2026', selection: [0, 10] }, 'deleteBackward').value).toBe('');
  });
});
