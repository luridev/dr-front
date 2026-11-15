import type { InjectionKey } from 'vue';
import type { LifecycleContext, LifecycleItem } from '@/forms/components/DrSelect/DrSelectLifecycle/types.support';

export const lifecycleContextKey: InjectionKey<LifecycleContext> = Symbol('Select consumer context');
export const lifecycleItems: readonly [LifecycleItem, LifecycleItem, LifecycleItem] = [{ label: 'Alpha' }, { label: 'Beta' }, { label: 'Gamma' }];
export const keepAliveItems: [string, string] = ['one', 'two'];
export const lifecycleStoryId = 'forms/components/DrSelect/DrSelectLifecycle/DrSelectLifecycle';
export const keepAliveStoryId = 'forms/components/DrSelect/DrSelectLifecycle/DrSelectKeepAlive';
