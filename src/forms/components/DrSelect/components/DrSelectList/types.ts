import type { DrSelectItemSlot } from '@/forms/components/DrSelect/types';

export type DrSelectListProps<T> = {
  id: string;
  items: ReadonlyArray<T>;
  selectedItem?: T;
  hasSelection: boolean;
  activeIndex?: number;
  accessibleLabel: string;
  tabindex?: -1 | 0;
};

export type DrSelectListEmits<T> = {
  activate: [index: number];
  select: [item: T];
};

export type DrSelectListSlots<T> = {
  item?: DrSelectItemSlot<T>;
};
