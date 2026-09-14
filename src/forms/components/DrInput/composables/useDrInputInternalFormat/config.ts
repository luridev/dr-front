import type { InjectionKey } from 'vue';
import type { DrInputInternalFormatSource } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';

export const drInputInternalFormatKey: InjectionKey<DrInputInternalFormatSource | undefined> =
  Symbol('DrInputInternalFormat');
