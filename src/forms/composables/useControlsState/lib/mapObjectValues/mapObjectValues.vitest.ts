import { describe, expect, it } from 'vitest';
import { mapObjectValues } from '@/forms/composables/useControlsState/lib/mapObjectValues/mapObjectValues';

describe('mapObjectValues', () => {
  it('maps an own __proto__ property without changing object prototypes', () => {
    const prototypeDescriptors = Object.entries(Object.getOwnPropertyDescriptors(Object.prototype));
    const input = Object.fromEntries([['__proto__', 1]]);

    const result = mapObjectValues(input, (key, value) => ({ key, value: value + 1 }));

    expect(Object.getOwnPropertyDescriptor(result, '__proto__')).toStrictEqual({
      value: { key: '__proto__', value: 2 },
      enumerable: true,
      configurable: true,
      writable: true,
    });

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.entries(Object.getOwnPropertyDescriptors(Object.prototype))).toStrictEqual(prototypeDescriptors);
  });
});
