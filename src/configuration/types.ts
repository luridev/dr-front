import type { ComputedRef } from 'vue';
import type { en } from '@/configuration/messages/en';

export type DrLanguage = 'en' | 'ru';
export type DrLocale = 'en-US' | 'en-GB' | 'ru-RU';
export type DrMessageKey = keyof typeof en;

export type DrMessages = {
  readonly [Key in DrMessageKey]: (...args: Parameters<typeof en[Key]>) => string;
};

export type MessageArguments<K extends DrMessageKey> = Parameters<DrMessages[K]>;

export type DrTranslate = <K extends DrMessageKey>(key: K, ...args: MessageArguments<K>) => string;

export type DrTranslationRequest = {
  [Key in DrMessageKey]: { key: Key; language: DrLanguage } & (
    MessageArguments<Key> extends [infer Params] ? { params: Params } : { params?: never }
  );
}[DrMessageKey];

export type DrTranslateOverride = (request: DrTranslationRequest) => string | undefined;

export type DrConfigProviderProps = {
  language?: DrLanguage;
  locale?: DrLocale;
  translate?: DrTranslateOverride;
};

export type DrResolvedConfig = Readonly<{
  explicitLanguage?: DrLanguage;
  explicitLocale?: DrLocale;
  language: DrLanguage;
  locale: DrLocale;
  translators: ReadonlyArray<DrTranslateOverride>;
}>;

export type DrConfigContext = ComputedRef<DrResolvedConfig>;
