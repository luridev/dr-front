import type { ComputedRef, DeepReadonly } from 'vue';

export type ControlStatePayload = Readonly<{
  messages?: readonly [string, ...Array<string>];
}>;

export type ControlStateDescriptor = Readonly<{
  disabled?: () => boolean;
  normalState?: () => ControlStatePayload | undefined;
  errorState?: () => ControlStatePayload | undefined;
}>;

export type ControlsStateDescriptors = Readonly<Record<string, ControlStateDescriptor>>;

export type ControlStateItem = Readonly<{
  disabled: boolean;
  state: 'normal' | 'error';
  messages?: readonly [string, ...Array<string>];
}>;

export type ControlsStateRefs<TControls extends ControlsStateDescriptors> = Readonly<{
  [TKey in keyof TControls]: ComputedRef<ControlStateItem>;
}>;

export type ControlsState<TControls extends ControlsStateDescriptors> = DeepReadonly<{
  [TKey in keyof TControls]: ControlStateItem;
}>;

export type UseControlsStateOptions<TControls extends ControlsStateDescriptors> = Readonly<{
  isDisabled?: () => boolean;
  isValid: () => boolean;
  controls: TControls;
}>;

export type UseControlsStateResult<TControls extends ControlsStateDescriptors> = Readonly<{
  controls: ControlsState<TControls>;
  showValidationErrors: () => void;
  resetControlsState: () => void;
  hasVisibleValidationErrors: ComputedRef<boolean>;
}>;
