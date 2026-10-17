import MaskedRange from 'imask/masked/range';
import type { MaskedPatternOptions } from 'imask/masked/pattern';

let temporalPlainDateMin: Temporal.PlainDate | undefined;
let temporalPlainDateMax: Temporal.PlainDate | undefined;

export const dateInputMaskOptions = {
  mask: 'D{.}`M{.}`Y',
  lazy: true,
  overwrite: false,
  autofix: true,
  prepare: (value, _masked, flags) => flags.input === true
    ? value
    : value.replace(
        /(^|\.)(\d)(?=\.)/g, (_match, boundary: string, digit: string) => `${boundary}0${digit}`,
      ),
  blocks: {
    D: { mask: MaskedRange, from: 1, to: 31, maxLength: 2, overwrite: true },
    M: { mask: MaskedRange, from: 1, to: 12, maxLength: 2, overwrite: true },
    Y: { mask: /^-?\d{0,6}$/ },
  },
} satisfies MaskedPatternOptions;

export const dateInputPattern = /^(\d{2})\.(\d{2})\.(-?\d{1,6})$/;
export const dateInputIncompletePattern = /^\d{0,2}(?:\.\d{0,2}(?:\.-?)?)?$/;

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
