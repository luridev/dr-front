import type { DrLanguage, DrLocale } from '@/configuration/types';

export type LocalizationOptions = {
  provider?: 'none' | 'config' | 'front';
  language?: DrLanguage;
  locale?: DrLocale;
  nested?: boolean;
};

export type LocalizationState = LocalizationOptions & {
  number: number | null;
  date: Temporal.PlainDate | null;
  time: Temporal.PlainTime | null;
  masked: string;
  textarea: string;
  numberUpdates: number;
  dateUpdates: number;
  timeUpdates: number;
  maskedUpdates: number;
  textareaUpdates: number;
  dateStatus: string;
  timeStatus: string;
};
