import type { Ref } from 'vue';
import type { DrLanguage } from '@/configuration/types';

export type LifecycleItem = {
  label: string;
};

export type LifecycleContext = {
  value: Readonly<Ref<string>>;
  unmounted: Ref<number>;
};

export type DrSelectLifecycleProps = {
  slot?: 'absent' | 'first' | 'second';
  contextValue?: string;
  suffix?: string;
  selectedIndex?: number;
  visible?: boolean;
  language?: DrLanguage;
};

export type DrSelectKeepAliveProps = {
  scope?: 'owner' | 'host';
  active?: boolean;
  secondary?: boolean;
};
