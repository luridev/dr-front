import type { Component, MaybeRef, Slot } from 'vue';

export type DrComponentEventHandler = (...args: Array<never>) => unknown;

export type DrComponentProperties<TProps extends object> = {
  [TKey in keyof TProps]: MaybeRef<TProps[TKey]>;
};

export type DrComponentSlots = Readonly<Record<string, Slot>>;

export type DrComponentDefinition = {
  component: Component;
  props?: object;
  events?: Readonly<Record<string, DrComponentEventHandler>>;
  slots?: DrComponentSlots;
};
