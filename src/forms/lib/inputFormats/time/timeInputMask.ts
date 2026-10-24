import MaskedRange from 'imask/masked/range';
import { getTimeInputFractionSeparatorPattern, timeInputFractionDigitsBySmallestUnit } from '@/forms/lib/inputFormats/time/config';
import type { MaskedPatternOptions } from 'imask/masked/pattern';
import type { TimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/types';

export function createTimeInputMaskOptions(
  smallestUnit: TimeInputSmallestUnit, hourCycle: 12 | 24 = 24, fractionalSecondSeparator = '.',
): MaskedPatternOptions {
  const fractionDigits = timeInputFractionDigitsBySmallestUnit[smallestUnit];
  const fractionLiteral = fractionalSecondSeparator.replaceAll(/./gs, '\\$&');
  const fractionSeparator = getTimeInputFractionSeparatorPattern(fractionalSecondSeparator);
  const shortSegmentPattern = new RegExp(`(^|:)(\\d)(?=:|${fractionSeparator}|$)`, 'g');

  return {
    mask: `H{:}\`M${smallestUnit === 'minute' ? '' : '[{:}`S]'}${fractionDigits === 0 ? '' : `[{${fractionLiteral}}\`F]`}`,
    lazy: true,
    overwrite: true,
    autofix: true,
    prepare: (value, masked, flags) => flags.input === true || masked.value.includes(fractionalSecondSeparator)
      ? value
      : value.replace(shortSegmentPattern, (_match, boundary: string, digit: string) => `${boundary}0${digit}`),
    blocks: {
      H: { mask: MaskedRange, from: hourCycle === 12 ? 1 : 0, to: hourCycle === 12 ? 12 : 23, maxLength: 2 },
      M: { mask: MaskedRange, from: 0, to: 59, maxLength: 2 },
      S: { mask: MaskedRange, from: 0, to: 59, maxLength: 2 },
      F: { mask: new RegExp(`^\\d{0,${fractionDigits}}$`) },
    },
  };
}
