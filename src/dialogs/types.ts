import type { Component, MaybeRef, Ref } from 'vue';
import type {
  DrComponentDefinition,
  DrComponentProperties,
  DrComponentSlots,
} from '@/dynamic-components/types';

export type DialogEventHandler<TArguments extends Array<unknown>> = (...args: TArguments) => void | Promise<void>;

export type DialogEventHandlers<TEvents extends object> = {
  [TEventName in keyof TEvents]?: TEvents[TEventName] extends Array<unknown>
    ? DialogEventHandler<TEvents[TEventName]>
    : never;
};

export type UseDialogOptions<TProps extends object> = {
  title: MaybeRef<string>;
  component: Component;
  props?: DrComponentProperties<TProps>;
  slots?: DrComponentSlots;
  footer?: DrComponentDefinition;
  closeOnBackdrop?: boolean;
};

export type UseDialog<TEvents extends object> = {
  id: string;
  isOpen: Readonly<Ref<boolean>>;
  open: (handlers?: DialogEventHandlers<TEvents>) => void;
  close: () => void;
};
