import type { DrSelectPresentation } from '@/forms/components/DrSelect/types';

export type DrSelectTriggerAria = {
  expanded: boolean;
  controls?: string;
  hasPopup: DrSelectPresentation;
  activeDescendant?: string;
};

export type DrSelectTriggerProps = {
  id: string;
  disabled: boolean;
  isPlaceholder: boolean;
  aria: DrSelectTriggerAria;
  invalid: boolean;
  describedBy?: string;
};

export type DrSelectTriggerEmits = {
  click: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
};

export type DrSelectTriggerExposed = {
  focus(options?: FocusOptions): void;
};
