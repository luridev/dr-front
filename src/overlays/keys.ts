import type { InjectionKey } from 'vue';
import type { createOverlayContext } from '@/overlays/lib/overlayContext/overlayContext';

export const drOverlayKey: InjectionKey<ReturnType<typeof createOverlayContext>> = Symbol('DrModalHost');
