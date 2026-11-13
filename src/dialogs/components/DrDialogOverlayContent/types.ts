import type { DrComponentDefinition } from '@/dynamicComponents/types';

export type DrDialogOverlayContentProps = {
  id: string;
  title: string;
  content: DrComponentDefinition;
  footer?: DrComponentDefinition;
  close: () => void;
};
