export type DrGridItemSpan = boolean | number;

export type DrGridItemSticky = 'top' | 'bottom';

export type DrGridItemJustify = 'left' | 'center' | 'right';

export type DrGridItemAlign = 'top' | 'center' | 'baseline' | 'bottom';

export type DrGridItemProps = {
  span?: DrGridItemSpan;
  sticky?: DrGridItemSticky;
  justify?: DrGridItemJustify;
  align?: DrGridItemAlign;
};
