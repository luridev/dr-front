import type { ControlState, DrControlFieldProps, DrControlKind } from '@/forms/components/DrControl/types';
import type { DrTextareaBaseEmits, DrTextareaBaseProps } from '@/forms/components/DrTextareaBase/types';

export type DrTextareaAria = {
  clearButtonAriaLabel?: string;
};

export type DrTextareaMode = 'textarea' | 'content';

export type DrTextareaProps = DrControlFieldProps &
  Pick<DrTextareaBaseProps, 'maxLength' | 'placeholder' | 'rows'> & {
    aria?: DrTextareaAria;
    clearable?: boolean;
    kind?: DrControlKind;
    mode?: DrTextareaMode;
  };

export type DrTextareaContentSlotProps = {
  id: string;
  labelId?: string;
  state: ControlState;
  disabled: boolean;
  describedBy?: string;
};

export type DrTextareaActionsSlotProps = {
  id: string;
  disabled: boolean;
};

export type DrTextareaSlots = {
  content?: (props: DrTextareaContentSlotProps) => unknown;
  actions?: (props: DrTextareaActionsSlotProps) => unknown;
};

export type DrTextareaEmits = DrTextareaBaseEmits;

export type DrTextareaModelProps = {
  modelValue: string;
};

export type DrTextareaModelEmits = {
  'update:modelValue': [value: string];
};

export type DrTextareaExposed = {
  focus: (options?: FocusOptions) => void;
};
