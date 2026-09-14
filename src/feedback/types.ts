export type DrAlertVariant = 'error' | 'warning' | 'info';

export type DrAlertData = Readonly<{
  variant: DrAlertVariant;
  title?: string;
  message: string;
  note?: string;
}>;

export type DrErrorAlertData = DrAlertData &
  Readonly<{
    variant: 'error';
  }>;
