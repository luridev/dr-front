import type { ComputedRef, Ref } from 'vue';

export type DialogFocusSetup = {
  root: Readonly<Ref<HTMLElement | null>>;
  active: ComputedRef<boolean>;
  returnFocus?: () => HTMLElement | false;
};
