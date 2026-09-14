export type ControlState = 'normal' | 'error';

export type DrControlKind = 'field' | 'group';

export type DrControlLabelPosition = 'top' | 'left' | 'right';

export type DrControlMessage = string | ReadonlyArray<string>;

export type DrControlBaseProps = {
  labelPosition?: DrControlLabelPosition;
  disabled?: boolean;
  state?: ControlState;
  message?: DrControlMessage;
};

export type DrControlFieldProps = DrControlBaseProps & {
  label?: string;
};

export type DrControlProps = DrControlBaseProps & {
  kind?: DrControlKind;
  bordered?: boolean;
};
