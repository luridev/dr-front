import type { ComputedRef, Ref } from 'vue';
import type { OverlayHandle, OverlayOptions } from '@/overlays/types';

export type UseOverlay = {
  isActive: Readonly<Ref<boolean>>;
  canOpenModal: ComputedRef<boolean>;
  portalTarget: ComputedRef<HTMLElement | null>;
  isTop: (token: symbol) => boolean;
  order: (token: symbol) => number;
  open: (options: OverlayOptions) => OverlayHandle | undefined;
};
