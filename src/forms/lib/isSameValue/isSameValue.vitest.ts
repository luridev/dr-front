import { expect, it } from 'vitest';
import { reactive, readonly } from 'vue';
import { isSameValue } from '@/forms/lib/isSameValue/isSameValue';

it('compares primitives without coercion', () => {
  expect(isSameValue<unknown>(1, '1')).toBe(false);
  expect(isSameValue<unknown>(false, 0)).toBe(false);
  expect(isSameValue<unknown>(null, undefined)).toBe(false);
  expect(isSameValue('one', 'one')).toBe(true);
  expect(isSameValue(NaN, NaN)).toBe(false);
  expect(isSameValue(0, -0)).toBe(true);
});

it('matches raw objects with their reactive and readonly proxies in either position', () => {
  const item = { id: 1 };
  const proxy = reactive(item);
  const readonlyProxy = readonly(proxy);

  expect(isSameValue(item, proxy)).toBe(true);
  expect(isSameValue(proxy, item)).toBe(true);
  expect(isSameValue(item, readonlyProxy)).toBe(true);
  expect(isSameValue(readonlyProxy, proxy)).toBe(true);
});

it('keeps different objects distinct even when their contents match', () => {
  const item = { id: 1 };

  expect(isSameValue(item, { ...item })).toBe(false);
  expect(isSameValue(reactive(item), readonly({ ...item }))).toBe(false);
});

it('compares arrays by their underlying identity', () => {
  const item = [1, 2];

  expect(isSameValue(item, reactive(item))).toBe(true);
  expect(isSameValue(readonly(item), item)).toBe(true);
  expect(isSameValue(item, [...item])).toBe(false);
});
