import { computed } from 'vue';
import { en } from '@/configuration/messages/en';
import { ru } from '@/configuration/messages/ru';
import type { DrConfigContext, DrLanguage, DrLocale, DrMessages } from '@/configuration/types';

export const defaultLanguage: DrLanguage = 'en';
export const defaultLocale: DrLocale = 'en-US';

export const defaultLocaleByLanguage = Object.freeze({
  en: 'en-US',
  ru: 'ru-RU',
} as const satisfies Record<DrLanguage, DrLocale>);

export const languageByLocale = Object.freeze({
  'en-US': 'en',
  'en-GB': 'en',
  'ru-RU': 'ru',
} as const satisfies Record<DrLocale, DrLanguage>);

export const dictionaries = Object.freeze({ en, ru } satisfies Record<DrLanguage, DrMessages>);

export const defaultConfig: DrConfigContext = computed(() => Object.freeze({
  language: defaultLanguage,
  locale: defaultLocale,
  translators: Object.freeze([]),
}));
