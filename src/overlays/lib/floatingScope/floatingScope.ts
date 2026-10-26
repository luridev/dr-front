import type { InjectionKey } from 'vue';
import type { FloatingScope } from '@/overlays/lib/floatingScope/types';

export const floatingScopeKey: InjectionKey<FloatingScope> = Symbol('DrFloatingScope');
