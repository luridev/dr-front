export type DrGridAlign = 'top' | 'center' | 'baseline' | 'bottom';

export type DrGridProps = {
  columns?: number;
  adaptive?: boolean;
  align?: DrGridAlign;
};
