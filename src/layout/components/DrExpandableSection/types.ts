export type DrExpandableSectionProps = {
  title: string;
  disabled?: boolean;
};

export type DrExpandableSectionSlots = {
  params?: () => unknown;
  default: () => unknown;
};
