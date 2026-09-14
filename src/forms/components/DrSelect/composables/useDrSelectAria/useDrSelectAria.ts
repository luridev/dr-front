import { computed, toValue } from 'vue';
import type { DrSelectTriggerAria } from '@/forms/components/DrSelect/components/DrSelectTrigger/types';
import type { UseDrSelectAriaParams } from '@/forms/components/DrSelect/composables/useDrSelectAria/types';

export function useDrSelectAria({
  presentation,
  isDesktopOpen,
  isDialogOpen,
  desktopListboxId,
  dialogId,
  activeIndex,
  itemsCount,
}: UseDrSelectAriaParams) {
  const triggerAria = computed<DrSelectTriggerAria>(() => {
    const desktopOpen = toValue(isDesktopOpen);
    const dialogOpen = toValue(isDialogOpen);
    const index = toValue(activeIndex);
    const itemCount = toValue(itemsCount);

    return {
      expanded: desktopOpen || dialogOpen,
      controls: desktopOpen ? desktopListboxId : dialogOpen ? dialogId : undefined,
      hasPopup: toValue(presentation),
      activeDescendant:
        desktopOpen && index >= 0 && index < itemCount ? `${desktopListboxId}-option-${index}` : undefined,
    };
  });

  return {
    triggerAria,
  };
}
