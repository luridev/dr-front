import type { DrButtonProps } from '@/actions/components/DrButton/types';

export type DrButtonContractProps = Pick<DrButtonProps, 'disabled' | 'loading' | 'focusRing'> & {
  incomingClass?: string;
  conditionalClass?: boolean;
};

export type DrButtonFormProps = Pick<DrButtonProps, 'disabled' | 'loading'> & {
  outside?: boolean;
};
