export type DrToastVariant = 'info' | 'success' | 'warning' | 'error';

export type DrToastOptions = {
  variant?: DrToastVariant;
  title?: string;
  message: string;
  duration?: number;
};

export type DrToastItem = {
  uid: number;
  key: string;
  variant: DrToastVariant;
  title: string;
  message: string;
  duration: number;
};

export type DrToastVariantOptions = Omit<DrToastOptions, 'variant'>;
