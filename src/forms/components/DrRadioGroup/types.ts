import type { DrControlFieldProps } from '@/forms/components/DrControl/types';

export type DrRadioGroupDirection = 'row' | 'column';

export type DrRadioGroupProps<T> = DrControlFieldProps & {
  items: ReadonlyArray<T>;
  direction?: DrRadioGroupDirection;
  name?: string;
};
