import type { DrToastVariant } from '@/feedback/toasts/types';

export type DrToastProps = {
  uid: number;
  variant: DrToastVariant;
  title: string;
  message: string;
  closeButtonTabindex?: number;
};

export type DrToastEmits = {
  close: [uid: number];
  hoverChange: [uid: number, value: boolean];
  focusWithinChange: [uid: number, value: boolean];
};
