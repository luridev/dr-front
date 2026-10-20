import type { Ref } from 'vue';
import type { UseDialog } from '@/dialogs/types';
import type { DrToastService } from '@/feedback/toasts/types';

export type ScopeProbe = { toast: DrToastService; dialog: UseDialog<object> };
export type ScopeRegistry = Map<string, ScopeProbe>;

export type ScopeOptions = {
  name: string;
  root: HTMLElement;
  registry: ScopeRegistry;
  ownerMounted: Ref<boolean>;
  sharedBackground: Ref<HTMLElement | null>;
};
