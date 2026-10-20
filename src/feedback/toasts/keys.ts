import type { InjectionKey } from 'vue';
import type { DrToastService } from '@/feedback/toasts/types';

export const drToastKey: InjectionKey<DrToastService | undefined> = Symbol('DrToastHost');
