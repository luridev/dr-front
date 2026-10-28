import type { DrMask } from '@/forms/components/DrMaskedInput/types';

function snapshotValue<T>(value: T, ancestors: Set<object>): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (ancestors.has(value)) {
    throw new TypeError('DrMaskedInput mask options must not contain cycles.');
  }

  const prototype: unknown = Object.getPrototypeOf(value);

  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('DrMaskedInput mask options support only plain objects, arrays, RegExp and Date objects.');
  }

  ancestors.add(value);

  const snapshot = Array.isArray(value)
    ? value.map((item: unknown) => snapshotValue(item, ancestors))
    : Object.fromEntries(Object.entries(value).map(([key, item]: [string, unknown]) => [
        key, snapshotValue(item, ancestors),
      ]));

  ancestors.delete(value);

  return snapshot as T;
}

function equalValues(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') {
    return false;
  }

  if (left instanceof RegExp || right instanceof RegExp) {
    return left instanceof RegExp && right instanceof RegExp
      && left.source === right.source && left.flags === right.flags;
  }

  if (left instanceof Date || right instanceof Date) {
    return left instanceof Date && right instanceof Date && Object.is(left.getTime(), right.getTime());
  }

  if (Array.isArray(left) !== Array.isArray(right)
    || (Array.isArray(left) && Array.isArray(right) && left.length !== right.length)) {
    return false;
  }

  const keys = Object.keys(left);
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;

  return keys.length === Object.keys(right).length
    && keys.every((key) => Object.hasOwn(right, key) && equalValues(leftRecord[key], rightRecord[key]));
}

export function resolveDrMaskOptions(mask: DrMask, previous?: Exclude<DrMask, string>): Exclude<DrMask, string> {
  const snapshot = snapshotValue(typeof mask === 'string' ? { mask } : mask, new Set());

  return previous !== undefined && equalValues(previous, snapshot) ? previous : snapshot;
}
