export type DrTabPanelProps<T extends string> = {
  switcherId: string;
  panelId: T;
  current: T;
};
