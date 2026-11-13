import type { Slot } from 'vue';
import type { DrComponentDefinition } from '@/dynamicComponents/types';

export type DrComponentProps = {
  definition: DrComponentDefinition;
};

export type DrComponentSlotRendererProps = {
  slotFunction: Slot;
  properties: unknown;
};
