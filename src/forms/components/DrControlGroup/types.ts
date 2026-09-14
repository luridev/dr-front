export type DrControlGroupLabelPosition = 'top' | 'left' | 'auto';

export type DrControlGroupLabelAlign = 'left' | 'center' | 'right';

export type DrControlGroupProps = {
  labelPosition?: DrControlGroupLabelPosition;
  labelWidth?: string;
  labelAlign?: DrControlGroupLabelAlign;
};
