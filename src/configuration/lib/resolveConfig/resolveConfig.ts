import { defaultConfig, defaultLocaleByLanguage, dictionaries, languageByLocale } from '@/configuration/config';
import type { DrConfigProviderProps, DrResolvedConfig } from '@/configuration/types';

export function resolveConfig(
  props: DrConfigProviderProps,
  parent: DrResolvedConfig = defaultConfig.value,
): DrResolvedConfig {
  if (props.language !== undefined && (typeof props.language !== 'string' || !Object.hasOwn(dictionaries, props.language))) {
    throw new Error(`DrConfigProvider: unsupported language "${props.language}". Use en or ru.`);
  }

  if (props.locale !== undefined && (typeof props.locale !== 'string' || !Object.hasOwn(languageByLocale, props.locale))) {
    throw new Error(`DrConfigProvider: unsupported locale "${props.locale}". Use en-US, en-GB or ru-RU.`);
  }

  if (props.translate !== undefined && typeof props.translate !== 'function') {
    throw new Error('DrConfigProvider: translate must be a function.');
  }

  const explicitLanguage = props.language ?? parent.explicitLanguage;
  const explicitLocale = props.locale ?? parent.explicitLocale;

  const language = explicitLanguage ??
    (explicitLocale == null ? defaultConfig.value.language : languageByLocale[explicitLocale]);

  const locale = explicitLocale ?? defaultLocaleByLanguage[language];

  const translators = props.translate === undefined
    ? parent.translators
    : Object.freeze([...new Set([props.translate, ...parent.translators])]);

  return Object.freeze({ explicitLanguage, explicitLocale, language, locale, translators });
}
