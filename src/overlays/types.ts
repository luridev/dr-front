import type { DrComponentDefinition } from '@/dynamic-components/types';
import type { DrToastService } from '@/feedback/toasts/types';

export type OverlayContextSnapshot = {
  toast: DrToastService | undefined;
};

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
  token: symbol;
  context: OverlayContextSnapshot;
  content: DrComponentDefinition;
  closeOnBackdrop: boolean;
  close: () => void;
};
