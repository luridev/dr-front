import type { Ref } from 'vue';
import type { DrSelectInitialActiveItem } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/types';

export type DrSelectTriggerKeyboardPopup = {
  isOpen: Readonly<Ref<boolean>>;
  close(): void;
};

export type DrSelectTriggerKeyboardNavigation = {
  moveActiveItem(offset: number): void;
  activateFirstItem(): void;
  activateLastItem(): void;
};

export type UseDrSelectTriggerKeyboardParams = {
  popup: DrSelectTriggerKeyboardPopup;
  navigation: DrSelectTriggerKeyboardNavigation;
  openOptions: (initialActiveItem?: DrSelectInitialActiveItem) => void;
  selectActiveItem: () => void;
};
