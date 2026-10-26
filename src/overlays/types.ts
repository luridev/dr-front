import type { DrConfigContext } from '@/configuration/types';
import type { DrComponentDefinition } from '@/dynamic-components/types';
import type { DrToastService } from '@/feedback/toasts/types';

export type OverlayContextSnapshot = {
  config: DrConfigContext;
  toast: DrToastService | undefined;
};

export type OverlayHandle = {
  close: () => void;
};

export type OverlayOptions = {
  opener?: HTMLElement | null;
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
