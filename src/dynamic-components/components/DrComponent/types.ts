import type { Slot } from 'vue';
import type { DrComponentDefinition } from '@/dynamic-components/types';

export type DrComponentProps = {
  definition: DrComponentDefinition;
};

export type DrComponentSlotRendererProps = {
  slotFunction: Slot;
  properties: unknown;
};
