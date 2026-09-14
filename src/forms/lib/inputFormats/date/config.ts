import type { MaskitoMask } from '@maskito/core';

const dateInputDigit = /[0-9]/;
const dateInputDayMonthMask = [dateInputDigit, dateInputDigit, '.', dateInputDigit, dateInputDigit, '.'];

const dateInputYearMask = [
  dateInputDigit,
  dateInputDigit,
  dateInputDigit,
  dateInputDigit,
  dateInputDigit,
  dateInputDigit,
];

const dateInputPositiveMask = [...dateInputDayMonthMask, ...dateInputYearMask];
const dateInputNegativeMask = [...dateInputDayMonthMask, /-/, ...dateInputYearMask];

let temporalPlainDateMin: Temporal.PlainDate | undefined;
let temporalPlainDateMax: Temporal.PlainDate | undefined;

function hasNegativeYear(value: string) {
  const yearStartIndex = value.includes('.') ? dateInputYearStartIndex : dateInputUnmaskedYearStartIndex;

  return value[yearStartIndex] === '-';
}

export const dateInputYearStartIndex = 6;
export const dateInputUnmaskedYearStartIndex = 4;
export const dateInputPattern = /^(\d{2})\.(\d{2})\.(-?\d{1,6})$/;
export const dateInputIncompletePattern = /^\d{0,2}(?:\.\d{0,2}(?:\.-?)?)?$/;

export const dateInputMask: MaskitoMask = ({ value }) =>
  hasNegativeYear(value) ? dateInputNegativeMask : dateInputPositiveMask;

export function getTemporalPlainDateMin() {
  temporalPlainDateMin ??= Temporal.PlainDate.from({
    year: -271_821,
    month: 4,
    day: 19,
  });

  return temporalPlainDateMin;
}

export function getTemporalPlainDateMax() {
  temporalPlainDateMax ??= Temporal.PlainDate.from({
    year: 275_760,
    month: 9,
    day: 13,
  });

  return temporalPlainDateMax;
}
