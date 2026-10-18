import type { DrMask } from '@/forms/components/DrMaskedInput/types';

export const maskedInputStoryId = 'forms/components/DrMaskedInput/DrMaskedInputGallery';
export const integerMask = { type: 'integer' } as const satisfies DrMask;
export const serialMask = { pattern: 'HH-0000', definitions: { H: /[A-F0-9]/ } } satisfies DrMask;
