import type { DrAlertData, DrAlertVariant } from '@/feedback/types';

export type DrAlertProps = Omit<DrAlertData, 'variant'> & {
  variant?: DrAlertVariant;
};
