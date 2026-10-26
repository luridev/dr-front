import type { InjectionKey } from 'vue';

export const dialogReturnFocusKey: InjectionKey<() => HTMLElement | false> = Symbol('DrDialogReturnFocus');
