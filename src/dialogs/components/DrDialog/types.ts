export type DrDialogProps = {
  id: string;
  title: string;
  close: () => void;
};

export type DrDialogSlots = {
  default: () => unknown;
  footer?: () => unknown;
};
