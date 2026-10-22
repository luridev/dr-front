import { describe, expect, it, vi } from 'vitest';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { getTemporalPlainDateMax, getTemporalPlainDateMin } from '@/forms/lib/inputFormats/date/config';
import {
  parseDateInputValue,
  stringifyDateInputValue,
} from '@/forms/lib/inputFormats/date/dateInputFormat';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';

const dateProfile = getInputLocaleProfile('ru-RU').date;

it('loads the date input format without a global Temporal', async () => {
  vi.resetModules();
  vi.stubGlobal('Temporal', undefined);

  try {
    await expect(import('@/forms/lib/inputFormats/date/dateInputFormat')).resolves.toBeDefined();
  } finally {
    vi.unstubAllGlobals();
  }
});

function expectValidDate(
  source: string, expected: string, profile: InputLocaleProfile['date'] = dateProfile,
): Temporal.PlainDate {
  const result = parseDateInputValue(source, profile);

  expect(result.status).toBe('valid');

  if (result.status !== 'valid') {
    throw new Error(`Expected ${source} to be a valid date`);
  }

  expect(result.value.equals(Temporal.PlainDate.from(expected))).toBe(true);

  return result.value;
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
    expect(parseDateInputValue(source, dateProfile)).toEqual({ status: 'invalid' });
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
    expect(parseDateInputValue(source, dateProfile)).toEqual({ status: 'invalid' });
  });

  it.each(['', '1', '01', '01.', '01.0', '01.01', '01.01.', '01.01.-'])(
    'distinguishes empty and incomplete input %j',
    (source) => {
      expect(parseDateInputValue(source, dateProfile)).toEqual({
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
    expect(parseDateInputValue(source, dateProfile)).toEqual({ status: 'invalid' });
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
    expect(parseDateInputValue(source, dateProfile)).toEqual({ status: 'out-of-range' });
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
    expect(stringifyDateInputValue(value, dateProfile)).toBe(expected);
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
    const result = parseDateInputValue(stringifyDateInputValue(value, dateProfile), dateProfile);

    expect(result.status).toBe('valid');

    if (result.status === 'valid') {
      expect(result.value.equals(value)).toBe(true);
    }
  });
});

describe('regional date profiles', () => {
  it.each([
    { locale: 'ru-RU', display: '01.02.2026', incomplete: '01.02.-', invalid: '31.02.2026' },
    { locale: 'en-US', display: '02/01/2026', incomplete: '02/01/-', invalid: '02/31/2026' },
    { locale: 'en-GB', display: '01/02/2026', incomplete: '01/02/-', invalid: '31/02/2026' },
  ] as const)('maps the same calendar date and validation through $locale', ({ locale, display, incomplete, invalid }) => {
    const profile = getInputLocaleProfile(locale).date;
    const model = Temporal.PlainDate.from('2026-02-01');

    expect(stringifyDateInputValue(model, profile)).toBe(display);
    expectValidDate(display, model.toString(), profile);
    expect(parseDateInputValue(incomplete, profile)).toEqual({ status: 'incomplete' });
    expect(parseDateInputValue(invalid, profile)).toEqual({ status: 'invalid' });
  });

  it.each(['ru-RU', 'en-US', 'en-GB'] as const)('preserves extended years and range validation in %s', (locale) => {
    const profile = getInputLocaleProfile(locale).date;

    for (const year of [0, -1, 10000, -100000]) {
      const model = Temporal.PlainDate.from({ year, month: 2, day: 1 });
      const display = stringifyDateInputValue(model, profile);

      expect(display).toMatch(new RegExp(`${year < 0 ? '-' : ''}${String(Math.abs(year)).padStart(4, '0')}$`));
      expectValidDate(display, model.toString(), profile);
    }

    const outOfRange = stringifyDateInputValue(getTemporalPlainDateMax(), profile).replace('275760', '275761');

    expect(parseDateInputValue(outOfRange, profile)).toEqual({ status: 'out-of-range' });
  });

  it('uses different multi-character literals without interpreting regular-expression syntax', () => {
    const profile: InputLocaleProfile['date'] = { order: ['month', 'day', 'year'], separators: ['[.] ', ' ($)\\'] };
    const model = Temporal.PlainDate.from('-010000-02-01');
    const display = '02[.] 01 ($)\\-10000';

    expect(stringifyDateInputValue(model, profile)).toBe(display);
    expectValidDate(display, model.toString(), profile);
    expect(parseDateInputValue('02[.] 01 ($)\\-', profile)).toEqual({ status: 'incomplete' });
    expect(parseDateInputValue('02.01-10000', profile)).toEqual({ status: 'invalid' });
    expect(parseDateInputValue('2[.] 1 ($)\\2026', profile)).toEqual({ status: 'invalid' });
  });

  it('reads order from the profile and serializes other calendars through ISO', () => {
    const profile: InputLocaleProfile['date'] = { order: ['year', 'month', 'day'], separators: [' / ', ' - '] };
    const model = Temporal.PlainDate.from('2026-02-01').withCalendar('gregory');
    const display = '2026 / 02 - 01';

    expect(stringifyDateInputValue(model, profile)).toBe(display);
    expect(expectValidDate(display, '2026-02-01', profile).calendarId).toBe('iso8601');
    expect(model.calendarId).toBe('gregory');
  });
});
