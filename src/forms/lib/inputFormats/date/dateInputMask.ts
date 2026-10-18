import MaskedRange from 'imask/masked/range';
import type { MaskedPatternOptions } from 'imask/masked/pattern';

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
