import { toRaw } from 'vue';

export function isSameValue<T>(first: T, second: T): boolean {
  return toRaw(first) === toRaw(second);
}
