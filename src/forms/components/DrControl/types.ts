export type ControlState = 'normal' | 'error';

export type DrControlKind = 'field' | 'group';

export type DrControlLabelPosition = 'top' | 'left' | 'right';

export type DrControlMessage = string | ReadonlyArray<string>;

export type DrControlBaseProps = {
  labelPosition?: DrControlLabelPosition | undefined;
  disabled?: boolean;
  state?: ControlState | undefined;
  message?: DrControlMessage | undefined;
};

export type DrControlFieldProps = DrControlBaseProps & {
  label?: string | undefined;
};

export type DrControlProps = DrControlBaseProps & {
  kind?: DrControlKind;
  bordered?: boolean;
};
