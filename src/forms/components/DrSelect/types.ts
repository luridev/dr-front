import type { Slot } from 'vue';
import type { DrControlFieldProps } from '@/forms/components/DrControl/types';

export type DrSelectPresentation = 'listbox' | 'dialog';

export type DrSelectItemSlotProps<T> = {
  item: T;
  index: number;
  selected: boolean;
  active: boolean;
};

export type DrSelectItemSlot<T> = Slot<DrSelectItemSlotProps<T>>;

export type DrSelectProps<T> = DrControlFieldProps & {
  items: ReadonlyArray<T>;
  placeholder?: string;
  emptyText?: string;
};

export type DrSelectSlots<T> = {
  label?: Slot;
  item?: DrSelectItemSlot<T>;
};

export type DrSelectExposed = {
  focus(options?: FocusOptions): void;
};
