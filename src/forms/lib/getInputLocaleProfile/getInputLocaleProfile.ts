import { inputLocaleDateTimeOptions, inputLocaleSamples } from '@/forms/lib/getInputLocaleProfile/config';
import type { DrLocale } from '@/configuration/types';
import type { InputLocaleDatePart, InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';

const profiles = new Map<DrLocale, InputLocaleProfile>();

function getDateProfile(format: Intl.DateTimeFormat): InputLocaleProfile['date'] {
  const order: Array<InputLocaleDatePart> = [];
  const separators: Array<string> = [];
  let separator = '';

  for (const part of format.formatToParts(inputLocaleSamples.date)) {
    if (part.type === 'day' || part.type === 'month' || part.type === 'year') {
      if (order.length > 0) {
        separators.push(separator);
      }

      order.push(part.type);
      separator = '';
    } else if (part.type === 'literal' && order.length > 0) {
      separator += part.value;
    }
  }

  if (order.length !== 3 || new Set(order).size !== 3) {
    throw new Error('Input locale date format must contain day, month and year.');
  }

  return Object.freeze({
    order: Object.freeze([order[0], order[1], order[2]] as const),
    separators: Object.freeze([separators[0], separators[1]] as const),
  });
}

function getTimeProfile(format: Intl.DateTimeFormat): InputLocaleProfile['time'] {
  const { hourCycle } = format.resolvedOptions();

  if (hourCycle !== 'h11' && hourCycle !== 'h12' && hourCycle !== 'h23' && hourCycle !== 'h24') {
    throw new Error('Input locale time format must provide an hour cycle.');
  }

  const is12Hour = hourCycle === 'h11' || hourCycle === 'h12';
  const parts = format.formatToParts(inputLocaleSamples.am);

  const fractionLiteral = parts.find((part, index) =>
    part.type === 'literal' && parts.at(index + 1)?.type === 'fractionalSecond');

  const fractionalSecondSeparator = fractionLiteral === undefined || fractionLiteral.value === ''
    ? '.'
    : fractionLiteral.value;

  const am = is12Hour ? parts.find((part) => part.type === 'dayPeriod')?.value : undefined;
  const pm = is12Hour ? format.formatToParts(inputLocaleSamples.pm).find((part) => part.type === 'dayPeriod')?.value : undefined;

  return Object.freeze({
    hourCycle: is12Hour ? 12 : 24,
    dayPeriods: am === undefined || pm === undefined ? null : Object.freeze({ am, pm }),
    fractionalSecondSeparator,
  });
}

export function getInputLocaleProfile(locale: DrLocale): InputLocaleProfile {
  const existing = profiles.get(locale);

  if (existing !== undefined) {
    return existing;
  }

  if (
    Intl.NumberFormat.supportedLocalesOf(locale).length === 0 ||
    Intl.DateTimeFormat.supportedLocalesOf(locale).length === 0
  ) {
    throw new Error(`Input locale "${locale}" is not supported by Intl.`);
  }

  const numberParts = new Intl.NumberFormat(locale, { numberingSystem: 'latn', useGrouping: true })
    .formatToParts(inputLocaleSamples.number);

  const group = numberParts.find((part) => part.type === 'group')?.value;
  const decimal = numberParts.find((part) => part.type === 'decimal')?.value;

  if (group === undefined || decimal === undefined) {
    throw new Error('Input locale number format must provide group and decimal separators.');
  }

  const profile: InputLocaleProfile = Object.freeze({
    number: Object.freeze({ group, decimal }),
    date: getDateProfile(new Intl.DateTimeFormat(locale, {
      ...inputLocaleDateTimeOptions, year: 'numeric', month: '2-digit', day: '2-digit',
    })),
    time: getTimeProfile(new Intl.DateTimeFormat(locale, {
      ...inputLocaleDateTimeOptions, hour: 'numeric', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
    })),
  });

  profiles.set(locale, profile);

  return profile;
}
