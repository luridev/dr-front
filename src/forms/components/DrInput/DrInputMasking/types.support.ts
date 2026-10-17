import type { DrInputTimeSmallestUnit } from '@/forms/components/DrInputTime/types';

export type DrInputMaskingProps = {
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
