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
  title: string | undefined;
  message: string;
  duration: number | undefined;
};

export type DrToastVariantOptions = Omit<DrToastOptions, 'variant'>;

/** Methods return a local notification ID, or 0 after the owning Host unmounts. */
export type DrToastService = {
  show: (options: DrToastOptions) => number;
  info: (options: DrToastVariantOptions) => number;
  success: (options: DrToastVariantOptions) => number;
  warning: (options: DrToastVariantOptions) => number;
  error: (options: DrToastVariantOptions) => number;
};
