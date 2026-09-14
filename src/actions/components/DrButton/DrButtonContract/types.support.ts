import type { DrButtonProps } from '@/actions/components/DrButton/types';

export type DrButtonContractProps = Pick<DrButtonProps, 'disabled' | 'loading'> & {
  incomingClass?: string;
  conditionalClass?: boolean;
};
