import type { DrOverlayLayer } from '@/overlays/types';

export type DrModalHostProps = {
  backgroundRoot: HTMLElement | null;
};

export type RenderedOverlayLayer = {
  layer: DrOverlayLayer;
  isTopLayer: boolean;
};
