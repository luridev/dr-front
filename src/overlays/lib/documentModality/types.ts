export type DocumentLayer = {
  token: symbol;
  backgroundRoot: HTMLElement;
  close: () => void;
  restoreFocusTo: HTMLElement | undefined;
};

export type BackgroundOwnership = {
  owners: Set<symbol>;
  originalInert: string | null;
};

export type OverflowSnapshot = {
  element: HTMLElement;
  value: string;
  priority: string;
};
