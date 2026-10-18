import { describe, expect, it } from 'vitest';
import { createMaskCodec } from '@/forms/components/DrMaskedInput/lib/maskCodec/maskCodec';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

describe('masked string codecs', () => {
  it('reuses semantically identical configurations and detects definition changes', () => {
    const integer = createMaskCodec({ type: 'integer' });
    expect(createMaskCodec({ type: 'integer' }, integer)).toBe(integer);
    const pattern = createMaskCodec('000-000');
    expect(createMaskCodec({ pattern: '000-000' }, pattern)).toBe(pattern);
    const mask = { pattern: 'HH-0000', definitions: { H: /[A-F]/ } };
    const custom = createMaskCodec(mask);
    expect(createMaskCodec({ pattern: mask.pattern, definitions: { H: /[A-F]/ } }, custom)).toBe(custom);
    mask.definitions.H = /[G-Z]/;
    const changed = createMaskCodec(mask, custom);
    expect(changed).not.toBe(custom);
    expect(changed.read('GH-1234').canonical).toBe('GH1234');
    mask.definitions.H = /[G-Z]/i;
    expect(createMaskCodec(mask, changed).read('gh-1234').canonical).toBe('gh1234');
  });

  it.each([
    ['', '', 'empty'], ['-', '', 'incomplete'], ['-0', '0', 'valid'],
    ['000', '0', 'valid'], ['000123', '123', 'valid'], ['-00123', '-123', 'valid'],
    ['1\u00a0234', '1234', 'valid'], ['-1234', '-1234', 'valid'],
    ['9007199254740993', '9007199254740993', 'valid'],
    [`-${'1234567890'.repeat(40)}`, `-${'1234567890'.repeat(40)}`, 'valid'],
  ])('integer %j produces %j (%s)', (display, canonical, status) => {
    const codec = createMaskCodec({ type: 'integer' });
    expect(codec.read(display)).toMatchObject({ canonical, status });
    expect(codec.write(canonical).canonical).toBe(canonical);
  });

  it.each<[DrMask, string, string, string]>([
    ['000-000', '123-456', '123456', 'valid'],
    ['000-000', '001-234', '001234', 'valid'],
    ['000-000', '123-', '123', 'incomplete'],
    ['000-000', '', '', 'empty'],
    [{ pattern: 'HH-0000', definitions: { H: /[A-F0-9]/ } }, 'AB-1234', 'AB1234', 'valid'],
    ['+{7} (000) 000-00-00', '+7 (999) 123-45-67', '79991234567', 'valid'],
  ])('pattern %j decodes %s', (mask, display, canonical, status) => {
    const codec = createMaskCodec(mask);
    expect(codec.read(display)).toEqual({ display, canonical, status });
    expect(codec.write(canonical)).toMatchObject({ canonical, status });
  });

  it.each<[DrMask, string]>([
    ['000-000', '123-456'], ['000-000', '1234567'], ['000-000', 'ABC'],
    [{ type: 'integer' }, '001'], [{ type: 'integer' }, '-0'], [{ type: 'integer' }, '-'],
    [{ type: 'integer' }, '1e3'], [{ type: 'integer' }, '1.2'], [{ type: 'integer' }, '+1'],
    [{ type: 'integer' }, '1\u00a0234'],
  ])('keeps incompatible external value %j / %j intact', (mask, canonical) => {
    expect(createMaskCodec(mask).write(canonical)).toEqual({ display: canonical, canonical, status: 'invalid' });
  });

  it('filters unsupported integer characters during editing', () => {
    const codec = createMaskCodec({ type: 'integer' });
    expect(codec.read('+|12x3').canonical).toBe('123');
  });
});
