import { computed, inject, provide, unref } from 'vue';
import { drInputInternalFormatKey } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/config';
import type { DrInputInternalFormatSource } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';

export function provideDrInputInternalFormat(source: DrInputInternalFormatSource) {
  provide(drInputInternalFormatKey, source);
}

export function useDrInputInternalFormat() {
  const source = inject(drInputInternalFormatKey, undefined);

  provide(drInputInternalFormatKey, undefined);

  return computed(() => unref(source));
}
