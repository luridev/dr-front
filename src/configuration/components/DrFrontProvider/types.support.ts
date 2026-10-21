import type { DrLocale } from '@/configuration/types';

export type DrFrontProviderGalleryProps = {
  ready?: boolean;
  mounted?: boolean;
  multiple?: boolean;
  locale?: DrLocale;
};

export type ProviderContentProps = {
  name: string;
};
