import type { InjectionKey } from 'vue';
import type { DrInputEditorFactory } from '@/forms/components/DrInput/composables/useDrInputEditor/types';

export const drInputEditorKey: InjectionKey<DrInputEditorFactory | undefined> = Symbol('DrInputEditor');
