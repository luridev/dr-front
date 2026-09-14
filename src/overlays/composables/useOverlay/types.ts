import type { OverlayHandle, OverlayOptions } from '@/overlays/types';

export type UseOverlay = {
  open: (options: OverlayOptions) => OverlayHandle;
};
