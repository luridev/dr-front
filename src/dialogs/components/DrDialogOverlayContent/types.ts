import type { DrComponentDefinition } from '@/dynamic-components/types';

export type DrDialogOverlayContentProps = {
  id: string;
  title: string;
  content: DrComponentDefinition;
  footer?: DrComponentDefinition;
  close: () => void;
};
