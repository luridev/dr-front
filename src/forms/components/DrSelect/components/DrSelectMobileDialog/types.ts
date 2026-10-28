import type { DrSelectListProps } from '@/forms/components/DrSelect/components/DrSelectList/types';
import type { DrOverlayLayer } from '@/overlays/types';

export type DrSelectMobileDialogProps<T> = Omit<DrSelectListProps<T>, 'tabindex'> & {
  dialogId: string;
  layer: DrOverlayLayer;
  portalTarget: HTMLElement;
  isTopLayer: boolean;
  order: number;
};

export type DrSelectMobileDialogEmits<T> = {
  select: [item: T];
};

export type DrSelectMobileDialogExposed = {
  readonly labelTarget: HTMLElement | null;
};
