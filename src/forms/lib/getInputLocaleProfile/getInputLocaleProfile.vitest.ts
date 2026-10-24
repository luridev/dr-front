import { afterEach, describe, expect, it, vi } from 'vitest';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import type { DrLocale } from '@/configuration/types';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';

afterEach(() => vi.restoreAllMocks());

describe('getInputLocaleProfile', () => {
  it.each<[DrLocale, InputLocaleProfile['date']['order'], 12 | 24]>([
    ['ru-RU', ['day', 'month', 'year'], 24],
    ['en-US', ['month', 'day', 'year'], 12],
    ['en-GB', ['day', 'month', 'year'], 24],
  ])('extracts %s metadata consistent with the current Intl runtime', (locale, order, hourCycle) => {
    const profile = getInputLocaleProfile(locale);
    const numberParts = new Intl.NumberFormat(locale, { numberingSystem: 'latn', useGrouping: true }).formatToParts(9876543.21);

    const dateParts = new Intl.DateTimeFormat(locale, {
      calendar: 'gregory', numberingSystem: 'latn', timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(Date.UTC(2031, 6, 19));

    const timeFormat = new Intl.DateTimeFormat(locale, {
      calendar: 'gregory',
      numberingSystem: 'latn',
      timeZone: 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    const timeParts = timeFormat.formatToParts(Date.UTC(2031, 6, 19, 23, 45, 56, 123));
    const fractionIndex = timeParts.findIndex((part) => part.type === 'fractionalSecond');

    expect(profile.time.fractionalSecondSeparator).toBe(locale === 'ru-RU' ? ',' : '.');
    expect(profile.time.fractionalSecondSeparator).toBe(timeParts[fractionIndex - 1].value);

    expect(profile.number).toEqual({
      group: numberParts.find((part) => part.type === 'group')?.value,
      decimal: numberParts.find((part) => part.type === 'decimal')?.value,
    });

    expect(profile.number.group).not.toBe('');
    expect(profile.number.decimal).toBe(locale === 'ru-RU' ? ',' : '.');
    expect(profile.date.order).toEqual(order);
    expect(dateParts.filter((part) => part.type !== 'literal').map((part) => part.type)).toEqual(order);
    expect(profile.date.separators).toEqual(dateParts.filter((part) => part.type === 'literal').map((part) => part.value));
    expect(profile.time.hourCycle).toBe(hourCycle);
    expect(profile.time.hourCycle === 12).toBe(timeFormat.resolvedOptions().hour12);

    if (hourCycle === 12) {
      expect(profile.time.dayPeriods).toEqual({
        am: timeFormat.formatToParts(Date.UTC(2031, 6, 19, 8)).find((part) => part.type === 'dayPeriod')?.value,
        pm: timeFormat.formatToParts(Date.UTC(2031, 6, 19, 20)).find((part) => part.type === 'dayPeriod')?.value,
      });

      expect(profile.time.dayPeriods?.am).toBeTruthy();
      expect(profile.time.dayPeriods?.pm).toBeTruthy();
      expect(profile.time.dayPeriods?.am).not.toBe(profile.time.dayPeriods?.pm);
    } else {
      expect(profile.time.dayPeriods).toBeNull();
    }
  });

  it('caches deeply immutable profiles without mixing locales', () => {
    const profile = getInputLocaleProfile('en-US');

    expect(getInputLocaleProfile('en-US')).toBe(profile);
    expect(getInputLocaleProfile('ru-RU')).not.toBe(profile);

    const nestedValues = [
      profile, profile.number, profile.date, profile.date.order, profile.date.separators,
      profile.time, profile.time.dayPeriods,
    ];

    for (const value of nestedValues) {
      expect(Object.isFrozen(value)).toBe(true);
    }
  });

  it('specifies locale, digits, calendar and UTC instead of depending on host defaults', async () => {
    vi.resetModules();
    const NativeNumberFormat = Intl.NumberFormat;
    const NativeDateTimeFormat = Intl.DateTimeFormat;

    const numberFormat = vi.spyOn(Intl, 'NumberFormat').mockImplementation(function (locale, options) {
      return new NativeNumberFormat(locale, options);
    });

    const dateTimeFormat = vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (locale, options) {
      return new NativeDateTimeFormat(locale, options);
    });

    const { getInputLocaleProfile: getFreshProfile } = await import('@/forms/lib/getInputLocaleProfile/getInputLocaleProfile');

    getFreshProfile('en-US');

    expect(numberFormat).toHaveBeenCalledWith('en-US', expect.objectContaining({ numberingSystem: 'latn', useGrouping: true }));
    expect(dateTimeFormat.mock.calls.length).toBeGreaterThan(0);

    for (const [locale, options] of dateTimeFormat.mock.calls) {
      expect(locale).toBe('en-US');
      expect(options).toMatchObject({ calendar: 'gregory', numberingSystem: 'latn', timeZone: 'UTC' });
      expect(options).not.toHaveProperty('hour12');
      expect(options).not.toHaveProperty('hourCycle');
      expect(options).not.toHaveProperty('dayPeriod');
    }
  });

  it('preserves Intl symbols verbatim without inventing missing day periods', async () => {
    vi.resetModules();

    vi.spyOn(Intl.NumberFormat.prototype, 'formatToParts').mockReturnValue([
      { type: 'integer', value: '1' }, { type: 'group', value: '\u202f' },
      { type: 'integer', value: '234' }, { type: 'decimal', value: '·' }, { type: 'fraction', value: '5' },
    ]);

    vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockImplementation(function (this: Intl.DateTimeFormat) {
      return this.resolvedOptions().year !== undefined
        ? [
            { type: 'literal', value: '(' }, { type: 'month', value: '11' },
            { type: 'literal', value: ' /' }, { type: 'literal', value: ' ' }, { type: 'day', value: '22' },
            { type: 'literal', value: '\u202f·' }, { type: 'year', value: '2006' }, { type: 'literal', value: ')' },
          ]
        : [];
    });

    const { getInputLocaleProfile: getFreshProfile } = await import('@/forms/lib/getInputLocaleProfile/getInputLocaleProfile');
    const profile = getFreshProfile('en-US');

    expect(profile.number).toEqual({ group: '\u202f', decimal: '·' });
    expect(profile.date).toEqual({ order: ['month', 'day', 'year'], separators: [' / ', '\u202f·'] });
    expect(profile.time).toEqual({ hourCycle: 12, dayPeriods: null, fractionalSecondSeparator: '.' });
  });

  it.each([
    { preceding: { type: 'literal', value: '·' }, expected: '·' },
    { preceding: { type: 'literal', value: '' }, expected: '.' },
    { preceding: { type: 'second', value: '56' }, expected: '.' },
  ] as const)('uses the time literal before fractionalSecond or a fallback: $preceding', async ({ preceding, expected }) => {
    vi.resetModules();
    const NativeDateTimeFormat = Intl.DateTimeFormat;

    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (locale, options) {
      const format = new NativeDateTimeFormat(locale, options);

      if (options?.hour !== undefined) {
        vi.spyOn(format, 'formatToParts').mockReturnValue([
          preceding, { type: 'fractionalSecond', value: '123' }, { type: 'literal', value: ' ' },
        ]);
      }

      return format;
    });

    const { getInputLocaleProfile: getFreshProfile } = await import('@/forms/lib/getInputLocaleProfile/getInputLocaleProfile');
    const profile = getFreshProfile('en-US');

    expect(profile.number.decimal).toBe('.');
    expect(profile.time.fractionalSecondSeparator).toBe(expected);
  });

  it.each(['NumberFormat', 'DateTimeFormat'] as const)('rejects missing %s locale data instead of falling back to the host locale', async (constructor) => {
    vi.resetModules();
    vi.spyOn(Intl[constructor], 'supportedLocalesOf').mockReturnValue([]);
    const { getInputLocaleProfile: getFreshProfile } = await import('@/forms/lib/getInputLocaleProfile/getInputLocaleProfile');

    expect(() => getFreshProfile('ru-RU')).toThrow('Input locale "ru-RU" is not supported by Intl.');
  });
});
