import IMask from 'imask/holder';
import { describe, expect, it } from 'vitest';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { parseDateInputValue } from '@/forms/lib/inputFormats/date/dateInputFormat';
import { getDateInputMaskOptions } from '@/forms/lib/inputFormats/date/dateInputMask';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';

describe.each(['ru-RU', 'en-US', 'en-GB'] as const)('date IMask contract for %s', (locale) => {
  const profile = getInputLocaleProfile(locale).date;
  const [firstSeparator, secondSeparator] = profile.separators;

  it('replays a partial unmasked fixed segment without consuming the first year digit', () => {
    const mask = IMask.createMask(getDateInputMaskOptions(profile));
    mask.unmaskedValue = `01${firstSeparator}0${secondSeparator}100000`;
    expect(mask.value.endsWith(`${secondSeparator}100000`)).toBe(true);
  });

  it.each(['01012026', '0101-100000', '01010000'])(
    'accepts compact date %s with a valid Temporal value', (text) => {
      const mask = IMask.createMask(getDateInputMaskOptions(profile));
      mask.resolve(text);
      expect(parseDateInputValue(mask.value, profile).status).toBe('valid');
      expect(mask.unmaskedValue).toBe(mask.value);
    },
  );

  it('inserts a year sign and replaces a fixed segment without consuming the year', () => {
    const mask = IMask.createMask(getDateInputMaskOptions(profile));
    mask.value = `01${firstSeparator}02${secondSeparator}100000`;
    mask.splice(6, 0, '-');
    expect(mask.value).toBe(`01${firstSeparator}02${secondSeparator}-100000`);
    mask.splice(3, 2, '0');
    mask.splice(4, 0, '3');
    expect(mask.value).toBe(`01${firstSeparator}03${secondSeparator}-100000`);
  });
});

it.each([
  { locale: 'ru-RU', compact: '01022026', display: '01.02.2026', model: '2026-02-01' },
  { locale: 'en-US', compact: '01022026', display: '01/02/2026', model: '2026-01-02' },
  { locale: 'en-GB', compact: '01022026', display: '01/02/2026', model: '2026-02-01' },
  { locale: 'en-US', compact: '0419-271821', display: '04/19/-271821', model: '-271821-04-19' },
  { locale: 'en-GB', compact: '1309275760', display: '13/09/275760', model: '+275760-09-13' },
] as const)('maps compact $locale input $compact to its regional calendar date', ({ locale, compact, display, model }) => {
  const profile = getInputLocaleProfile(locale).date;
  const mask = IMask.createMask(getDateInputMaskOptions(profile));
  mask.resolve(compact);

  expect(mask.value).toBe(display);
  expect(mask.unmaskedValue).toBe(display);

  const result = parseDateInputValue(mask.value, profile);

  expect(result.status).toBe('valid');

  if (result.status === 'valid') {
    expect(result.value.toString()).toBe(model);
  }
});

it('escapes distinct multi-character pattern literals and preserves them during unmasked replay', () => {
  const profile: InputLocaleProfile['date'] = { order: ['month', 'day', 'year'], separators: ['[D.] ', '{M}`\\'] };
  const mask = IMask.createMask(getDateInputMaskOptions(profile));
  const display = '02[D.] 01{M}`\\-100000';
  mask.resolve('0201-100000');

  expect(mask.value).toBe(display);
  expect(mask.unmaskedValue).toBe(display);

  mask.unmaskedValue = '2[D.] 1{M}`\\-100000';

  expect(mask.value).toBe(display);
  expect(parseDateInputValue(mask.value, profile).status).toBe('valid');
});
