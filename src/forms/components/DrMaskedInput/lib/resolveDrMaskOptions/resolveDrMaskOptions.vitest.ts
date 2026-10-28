import { createMask } from 'imask';
import { describe, expect, it } from 'vitest';
import { resolveDrMaskOptions } from '@/forms/components/DrMaskedInput/lib/resolveDrMaskOptions/resolveDrMaskOptions';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

describe('mask option snapshots', () => {
  it('detaches nested data and mutable Date/RegExp values from the consumer', () => {
    const minimum = new Date(2024, 0, 1);
    const definition = /[A-F]/i;
    const source = { mask: 'date', blocks: { date: { mask: Date, min: minimum } }, definitions: { H: definition } };
    const snapshot = resolveDrMaskOptions(source);
    minimum.setFullYear(2025);
    definition.lastIndex = 2;
    source.blocks.date.min = new Date(2026, 0, 1);

    expect(snapshot).toEqual({
      mask: 'date',
      blocks: { date: { mask: Date, min: new Date(2024, 0, 1) } },
      definitions: { H: /[A-F]/i },
    });

    expect(snapshot).not.toBe(source);

    expect(resolveDrMaskOptions(source, snapshot)).not.toBe(snapshot);
    expect(snapshot).toHaveProperty('definitions.H.lastIndex', 0);
  });

  it('distinguishes absent keys from explicitly undefined options', () => {
    const initial = resolveDrMaskOptions({ mask: '00' });
    const explicit = resolveDrMaskOptions({ mask: '00', lazy: undefined }, initial);
    expect(explicit).not.toBe(initial);
    expect(Object.hasOwn(explicit, 'lazy')).toBe(true);
    const removed = resolveDrMaskOptions({ mask: '00' }, explicit);
    expect(removed).not.toBe(explicit);
    expect(Object.hasOwn(removed, 'lazy')).toBe(false);
  });

  it('accepts shared acyclic blocks and ignores property insertion order', () => {
    const block = { mask: '00' };
    const initial = resolveDrMaskOptions({ mask: 'a:b', blocks: { a: block, b: block } });
    const next = resolveDrMaskOptions({ blocks: { b: { mask: '00' }, a: { mask: '00' } }, mask: 'a:b' }, initial);
    expect(next).toBe(initial);
    block.mask = '000';
    expect(initial).toHaveProperty('blocks.a.mask', '00');
    expect(initial).toHaveProperty('blocks.b.mask', '00');
  });

  it('accepts a dictionary without a prototype as declarative block options', () => {
    const block = Object.assign(Object.create(null) as { mask: string }, { mask: '00' });
    const snapshot = resolveDrMaskOptions({ mask: 'num', blocks: { num: block } });
    expect(resolveDrMaskOptions({ mask: 'num', blocks: { num: { mask: '00' } } }, snapshot)).toBe(snapshot);
    block.mask = '000';
    expect(snapshot).toHaveProperty('blocks.num.mask', '00');
  });

  it.each([null, /[A-F]/i, new Date(2024, 0, 1), []])('detects replacing custom option data %s with an object', (metadata) => {
    const options = { mask: '00', metadata };
    const snapshot = resolveDrMaskOptions(options);
    const replacement = { mask: '00', metadata: {} };
    expect(resolveDrMaskOptions(replacement, snapshot)).not.toBe(snapshot);
    expect(resolveDrMaskOptions(options, resolveDrMaskOptions(replacement))).not.toEqual(replacement);
  });

  it('rejects cyclic data with a clear configuration error', () => {
    const cycle: Record<string, unknown> = { mask: '00' };
    cycle.blocks = { recursive: cycle };
    expect(() => resolveDrMaskOptions(cycle as DrMask)).toThrow('must not contain cycles');
  });

  it('rejects live nested mask instances instead of traversing their internal state', () => {
    const block = createMask({ mask: '00' });
    expect(() => resolveDrMaskOptions({ mask: 'num', blocks: { num: block } })).toThrow('only plain objects');
  });
});
