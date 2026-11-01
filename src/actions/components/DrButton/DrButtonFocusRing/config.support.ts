import type { DrButtonState, DrButtonVariant } from '@/actions/components/DrButton/types';

const variants: ReadonlyArray<DrButtonVariant> = ['outline', 'solid', 'ghost'];
const states: ReadonlyArray<DrButtonState> = ['normal', 'warning', 'danger'];
const sides = ['start', 'end'] as const;

export const focusRingCases = sides.flatMap((side) => states.flatMap((state) => variants.map((variant) => ({
  side,
  state,
  variant,
  name: `${side} ${state} ${variant}`,
}))));
