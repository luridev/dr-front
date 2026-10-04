import type { DrTextareaProps } from '@/forms/components/DrTextarea/types';

export type DrTextareaPlaygroundProps = Pick<
  DrTextareaProps,
  'disabled' | 'readonly' | 'state' | 'message' | 'maxLength'
>;
