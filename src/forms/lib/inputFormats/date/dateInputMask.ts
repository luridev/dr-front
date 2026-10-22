import MaskedRange from 'imask/masked/range';
import type { MaskedPatternOptions } from 'imask/masked/pattern';
import type { InputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/types';

function prepareDateInputValue(value: string, profile: InputLocaleProfile['date']) {
  let offset = 0;
  let prepared = '';

  for (const [index, separator] of profile.separators.entries()) {
    const boundary = value.indexOf(separator, offset);

    if (boundary === -1) {
      break;
    }

    const segment = value.slice(offset, boundary);

    prepared += profile.order[index] !== 'year' && /^\d$/.test(segment) ? `0${segment}` : segment;
    prepared += separator;
    offset = boundary + separator.length;
  }

  return prepared + value.slice(offset);
}

export function getDateInputMaskOptions(profile: InputLocaleProfile['date']): MaskedPatternOptions {
  const blocks = { day: 'D', month: 'M', year: 'Y' };

  const mask = profile.order.map((part, index) => {
    const literal = index === 2 ? '' : `{${profile.separators[index].replaceAll(/./gs, '\\$&')}}\``;

    return blocks[part] + literal;
  }).join('');

  return {
    mask,
    lazy: true,
    overwrite: false,
    autofix: true,
    prepare: (value, _masked, flags) => flags.input === true ? value : prepareDateInputValue(value, profile),
    blocks: {
      D: { mask: MaskedRange, from: 1, to: 31, maxLength: 2, overwrite: true },
      M: { mask: MaskedRange, from: 1, to: 12, maxLength: 2, overwrite: true },
      Y: { mask: /^-?\d{0,6}$/ },
    },
  };
}
