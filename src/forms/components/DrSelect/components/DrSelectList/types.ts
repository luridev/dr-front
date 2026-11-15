import type { DrSelectItemSlot } from '@/forms/components/DrSelect/types';

export type DrSelectListProps<T> = {
  id: string;
  items: ReadonlyArray<T>;
  selectedItem?: T | undefined;
  hasSelection: boolean;
  activeIndex?: number | undefined;
  accessibleLabel: string;
  labelledBy?: string | undefined;
  tabindex?: -1 | 0;
};

export type DrSelectListEmits<T> = {
  activate: [index: number];
  select: [item: T];
};

export type DrSelectListSlots<T> = {
  item?: DrSelectItemSlot<T>;
};

export type DrSelectListExposed = {
  ensureActiveVisible(): void;
};
