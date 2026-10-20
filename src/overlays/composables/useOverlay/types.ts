import type { ComputedRef } from 'vue';
import type { OverlayHandle, OverlayOptions } from '@/overlays/types';

export type UseOverlay = {
  canOpenModal: ComputedRef<boolean>;
  open: (options: OverlayOptions) => OverlayHandle | undefined;
};
