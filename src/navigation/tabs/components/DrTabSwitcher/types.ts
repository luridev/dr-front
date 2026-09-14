export type DrTabSwitcherOrientation = 'horizontal' | 'vertical';

export type DrTabSwitcherAria = {
  ariaLabel: string;
};

export type DrTabSwitcherProps<T extends string> = {
  id: string;
  items: ReadonlyArray<T>;
  aria: DrTabSwitcherAria;
  orientation?: DrTabSwitcherOrientation;
};
