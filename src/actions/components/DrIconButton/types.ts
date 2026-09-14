export type DrIconButtonAria = {
  ariaLabel: string;
  ariaControls?: string;
};

export type DrIconButtonProps = {
  aria: DrIconButtonAria;
  disabled?: boolean;
  tabindex?: number;
};

export type DrIconButtonEmits = {
  click: [event: MouseEvent];
  pointerdown: [event: PointerEvent];
};

export type DrIconButtonSlots = {
  default: () => unknown;
};
