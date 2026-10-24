import type { DrControlMessage, ControlState } from '@/forms/components/DrControl/types';
import type { DrInputAria } from '@/forms/components/DrInput/types';
import type { DrInputTimeSmallestUnit } from '@/forms/components/DrInputTime/types';

export type DrInputMaskingProps = {
  aria?: Pick<DrInputAria, 'ariaInvalid'>;
  state?: ControlState;
  message?: DrControlMessage;
  smallestUnit?: DrInputTimeSmallestUnit;
  showTime?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  externalDate?: string | null;
  externalTime?: string | null;
  externalNumber?: number | null;
  externalInteger?: string;
  min?: number;
  max?: number;
  step?: number;
};
