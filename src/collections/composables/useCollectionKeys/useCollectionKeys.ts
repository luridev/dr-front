import { shallowRef, toValue, watchEffect } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export function useCollectionKeys<T>(collection: MaybeRefOrGetter<ReadonlyArray<T>>) {
  let counter = 0;

  const keys = shallowRef(new Map<T, string>());

  watchEffect(() => {
    const items = toValue(collection);
    const nextKeys = new Map<T, string>();

    for (const item of items) {
      const existingKey = keys.value.get(item);

      if (existingKey != null) {
        nextKeys.set(item, existingKey);
      } else {
        counter += 1;
        nextKeys.set(item, `collection-key-${counter}`);
      }
    }

    keys.value = nextKeys;
  });

  return (item: T) => {
    const key = keys.value.get(item);

    if (key == null) {
      throw new Error('Collection key not found');
    }

    return key;
  };
}
