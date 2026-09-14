import { readonly, ref, watch } from 'vue';
import type { DrSelectInitialActiveItem } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/types';

type UseDrSelectNavigationOptions<T> = {
  getItems: () => ReadonlyArray<T>;
  getSelectedItem: () => T | undefined;
};

export function useDrSelectNavigation<T>(options: UseDrSelectNavigationOptions<T>) {
  const activeIndex = ref(-1);

  function getSelectedIndex() {
    const selectedItem = options.getSelectedItem();

    return selectedItem === undefined ? -1 : options.getItems().findIndex((item) => item === selectedItem);
  }

  function getLoopedIndex(index: number) {
    const itemCount = options.getItems().length;

    if (itemCount === 0) {
      return -1;
    }

    return (index + itemCount) % itemCount;
  }

  function activateItem(index: number) {
    activeIndex.value = index >= 0 && index < options.getItems().length ? index : -1;
  }

  function activateFirstItem() {
    activateItem(0);
  }

  function activateLastItem() {
    activateItem(options.getItems().length - 1);
  }

  function moveActiveItem(offset: number) {
    const startIndex = activeIndex.value >= 0 ? activeIndex.value : getSelectedIndex();

    activateItem(getLoopedIndex(startIndex + offset));
  }

  function activateInitialItem(position: DrSelectInitialActiveItem = 'selected') {
    const itemCount = options.getItems().length;
    const selectedIndex = getSelectedIndex();

    if (itemCount === 0) {
      activateItem(-1);

      return;
    }

    switch (position) {
      case 'first':
        activateFirstItem();

        return;

      case 'last':
        activateLastItem();

        return;

      case 'next':
        activateItem(selectedIndex >= 0 ? getLoopedIndex(selectedIndex + 1) : 0);

        return;

      case 'previous':
        activateItem(selectedIndex >= 0 ? getLoopedIndex(selectedIndex - 1) : itemCount - 1);

        return;

      case 'selected':
        activateItem(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }

  watch(
    () => options.getItems().length,
    (itemCount) => {
      if (itemCount === 0) {
        activateItem(-1);
      } else if (activeIndex.value >= itemCount) {
        activateInitialItem();
      }
    },
  );

  return {
    activeIndex: readonly(activeIndex),
    activateItem,
    activateFirstItem,
    activateLastItem,
    moveActiveItem,
    activateInitialItem,
  };
}
