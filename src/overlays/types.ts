import type { DrComponentDefinition } from '@/dynamic-components/types';

export type OverlayHandle = {
  close: () => void;
};

export type OverlayOptions = {
  content: DrComponentDefinition;
  closeOnBackdrop?: boolean;
  onClose?: () => void;
};

export type DrOverlayLayer = {
  uid: number;
  content: DrComponentDefinition;
  closeOnBackdrop: boolean;
  close: () => void;
};
