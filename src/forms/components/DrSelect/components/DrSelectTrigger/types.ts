import type { DrSelectPresentation } from '@/forms/components/DrSelect/types';

export type DrSelectTriggerAria = {
  expanded: boolean;
  controls?: string | undefined;
  hasPopup: DrSelectPresentation;
  activeDescendant?: string | undefined;
};

export type DrSelectTriggerProps = {
  id: string;
  disabled: boolean;
  isPlaceholder: boolean;
  aria: DrSelectTriggerAria;
  accessibleLabel: string;
  labelledBy?: string | undefined;
  invalid: boolean;
  describedBy?: string | undefined;
};

export type DrSelectTriggerEmits = {
  click: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
};

export type DrSelectTriggerExposed = {
  readonly element: HTMLButtonElement | null;
  focus(options?: FocusOptions): void;
};
