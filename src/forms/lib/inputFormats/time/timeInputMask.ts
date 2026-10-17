import MaskedRange from 'imask/masked/range';
import { timeInputConfigBySmallestUnit } from '@/forms/lib/inputFormats/time/config';
import type { MaskedPatternOptions } from 'imask/masked/pattern';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

export function createTimeInputMaskOptions(smallestUnit: TimeInputSmallestUnit): MaskedPatternOptions {
  const fractionDigits = timeInputConfigBySmallestUnit[smallestUnit].maximumFractionDigitLength;

  return {
    mask: `H{:}\`M${smallestUnit === 'minute' ? '' : '[{:}`S]'}${fractionDigits === 0 ? '' : '[{.}`F]'}`,
    lazy: true,
    overwrite: true,
    autofix: true,
    prepare: (value, _masked, flags) => flags.input === true
      ? value
      : value.replace(
          /(^|:)(\d)(?=[:.]|$)/g, (_match, boundary: string, digit: string) => `${boundary}0${digit}`,
        ),
    blocks: {
      H: { mask: MaskedRange, from: 0, to: 23, maxLength: 2 },
      M: { mask: MaskedRange, from: 0, to: 59, maxLength: 2 },
      S: { mask: MaskedRange, from: 0, to: 59, maxLength: 2 },
      F: { mask: new RegExp(`^\\d{0,${fractionDigits}}$`) },
    },
  };
}
