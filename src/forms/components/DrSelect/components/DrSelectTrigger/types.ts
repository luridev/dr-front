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
  accessibleLabel: string;
  labelledBy?: string;
  invalid: boolean;
  describedBy?: string;
};

export type DrSelectTriggerEmits = {
  click: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
};

export type DrSelectTriggerExposed = {
  readonly element: HTMLButtonElement | null;
  focus(options?: FocusOptions): void;
};
