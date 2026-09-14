export type DrButtonState = 'normal' | 'warning' | 'danger';

export type DrButtonVariant = 'solid' | 'outline' | 'ghost';

export type DrButtonSize = 'small' | 'medium' | 'large';

export type DrButtonMessage = string | ReadonlyArray<string>;

export type DrButtonAria = {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
};

export type DrButtonProps = {
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  state?: DrButtonState;
  variant?: DrButtonVariant;
  size?: DrButtonSize;
  disabled?: boolean;
  loading?: boolean;
  message?: DrButtonMessage;
  aria?: DrButtonAria;
};

export type DrButtonEmits = {
  click: [event: MouseEvent];
  pointerdown: [event: PointerEvent];
};
