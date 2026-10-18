import createMask from 'imask/masked/factory';
import 'imask/masked/pattern';
import { draftIntegerMaskOptions } from '@/forms/components/DrMaskedInput/lib/maskCodec/config';
import { canonicalizeInteger } from '@/forms/components/DrMaskedInput/lib/maskCodec/integerCodec';
import type { DrMaskCodec, DrMaskValue } from '@/forms/components/DrMaskedInput/lib/maskCodec/types';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

export function createMaskCodec(mask: DrMask, previous?: DrMaskCodec): DrMaskCodec {
  const integer = typeof mask !== 'string' && 'type' in mask;
  const definitions = typeof mask === 'string' || integer ? {} : mask.definitions ?? {};

  const key = integer
    ? 'integer'
    : JSON.stringify([
        typeof mask === 'string' ? mask : mask.pattern,
        Object.keys(definitions).sort().map((name) => [name, definitions[name].source, definitions[name].flags]),
      ]);

  if (previous?.key === key) {
    return previous;
  }

  const options = integer
    ? draftIntegerMaskOptions
    : {
        mask: typeof mask === 'string' ? mask : mask.pattern,
        definitions: typeof mask === 'string' ? undefined : { ...mask.definitions },
      };

  const engine = createMask(options);

  function read(display: string): DrMaskValue {
    engine.value = display;
    const canonical = integer ? canonicalizeInteger(engine.value) : engine.unmaskedValue;

    return {
      display: engine.value,
      canonical,
      status: engine.value === ''
        ? 'empty'
        : integer
          ? canonical === '' ? 'incomplete' : 'valid'
          : engine.isComplete ? 'valid' : 'incomplete',
    };
  }

  function write(canonical: string): DrMaskValue {
    engine.unmaskedValue = canonical;
    const result = read(engine.value);

    return result.canonical === canonical ? result : { display: canonical, canonical, status: 'invalid' };
  }

  return { key, options, inputMode: integer ? 'numeric' : 'text', read, write };
}
