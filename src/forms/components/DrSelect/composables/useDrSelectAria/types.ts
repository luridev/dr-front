import type { MaybeRefOrGetter } from 'vue';
import type { DrSelectPresentation } from '@/forms/components/DrSelect/types';

export type UseDrSelectAriaParams = {
  presentation: MaybeRefOrGetter<DrSelectPresentation>;
  isDesktopOpen: MaybeRefOrGetter<boolean>;
  isDialogOpen: MaybeRefOrGetter<boolean>;
  desktopListboxId: string;
  dialogId: string;
  activeIndex: MaybeRefOrGetter<number>;
  itemsCount: MaybeRefOrGetter<number>;
};
