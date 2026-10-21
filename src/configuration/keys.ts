import type { InjectionKey } from 'vue';
import type { DrConfigContext } from '@/configuration/types';

export const drConfigKey: InjectionKey<DrConfigContext> = Symbol('DrConfig');
