import type { ComputedRef, Ref } from 'vue';

export type FloatingScope = {
  target: Readonly<Ref<HTMLElement | null>>;
  active: ComputedRef<boolean>;
};
