import { MaskedEnum, MaskedRange } from 'imask';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

export const maskedInputStoryId = 'forms/components/DrMaskedInput/DrMaskedInputGallery';
export const serialMask = { mask: 'HH-0000', definitions: { H: /[A-F0-9]/ } } satisfies DrMask;
export const digitsMask = { mask: /^\d*$/ } satisfies DrMask;
export const repeatMask = { mask: 'code', blocks: { code: { mask: '0', repeat: [1, 30] } } } satisfies DrMask;
export const dynamicMask = { mask: [{ mask: '00-00' }, { mask: 'AA-000', definitions: { A: /[A-Z]/ } }] } satisfies DrMask;

export const nativeMasks = {
  digits: digitsMask,
  repeat: repeatMask,
  dynamic: dynamicMask,
  placeholders: { mask: '+{7} (000)', lazy: false },
  emptyPlaceholders: { mask: '000-000', lazy: false },
  concealedPlaceholder: { mask: '0', displayChar: '_', lazy: false },
  prepared: { mask: 'aaaa', prepareChar: (value: string) => value.replace(/[a-y]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 1)) },
  hidden: { mask: '000-000', displayChar: '#' },
  overwrite: { mask: '000-000', overwrite: true },
  exposed: { mask: '00:num', blocks: { num: { mask: '00', expose: true } } },
  number: { mask: Number, scale: 2, radix: ',' },
  boundedNumber: { mask: Number, min: 5 },
  date: { mask: Date },
  function: { mask: (value: string) => /^\d*$/.test(value) },
  range: { mask: MaskedRange, from: 1, to: 90, autofix: true },
  enum: { mask: MaskedEnum, enum: ['red', 'green'] },
} satisfies Record<string, DrMask>;
