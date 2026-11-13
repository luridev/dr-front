import type { FunctionalComponent } from 'vue';
import type { DrComponentSlotRendererProps } from '@/dynamicComponents/components/DrComponent/types';

const renderDrComponentSlot: FunctionalComponent<DrComponentSlotRendererProps> = (props) =>
  props.slotFunction(props.properties);

renderDrComponentSlot.props = ['slotFunction', 'properties'];

export const DrComponentSlotRenderer = renderDrComponentSlot;
