import { describe, expect, it } from 'vitest';
import { computed, reactive } from 'vue';
import { defaultConfig } from '@/configuration/config';
import { resolveConfig } from '@/configuration/lib/resolveConfig/resolveConfig';
import type { DrConfigProviderProps, DrLanguage, DrLocale } from '@/configuration/types';

describe('configuration resolution', () => {
  it.each<[DrConfigProviderProps, DrLanguage, DrLocale]>([
    [{}, 'en', 'en-US'],
    [{ language: 'ru' }, 'ru', 'ru-RU'],
    [{ language: 'en' }, 'en', 'en-US'],
    [{ locale: 'en-GB' }, 'en', 'en-GB'],
    [{ locale: 'ru-RU' }, 'ru', 'ru-RU'],
    [{ language: 'en', locale: 'ru-RU' }, 'en', 'ru-RU'],
    [{ language: 'ru', locale: 'en-GB' }, 'ru', 'en-GB'],
  ])('resolves %j to %s / %s', (props, language, locale) => {
    expect(resolveConfig(props)).toMatchObject({ language, locale });
  });

  it('inherits explicit values before deriving defaults and follows changes and resets', () => {
    const outer = reactive<DrConfigProviderProps>({ language: 'ru' });
    const inner = reactive<DrConfigProviderProps>({ language: 'en' });
    const parent = computed(() => resolveConfig(outer));
    const child = computed(() => resolveConfig(inner, parent.value));

    expect(child.value).toMatchObject({ language: 'en', locale: 'en-US' });
    inner.language = undefined;
    expect(child.value).toMatchObject({ language: 'ru', locale: 'ru-RU' });
    outer.language = 'en';
    expect(child.value).toMatchObject({ language: 'en', locale: 'en-US' });
    outer.locale = 'ru-RU';
    inner.language = 'en';
    expect(child.value).toMatchObject({ language: 'en', locale: 'ru-RU' });
    outer.language = 'ru';
    expect(child.value).toMatchObject({ language: 'en', locale: 'ru-RU' });
    inner.locale = 'en-GB';
    inner.language = undefined;
    expect(child.value).toMatchObject({ language: 'ru', locale: 'en-GB' });
    outer.language = undefined;
    expect(child.value).toMatchObject({ language: 'en', locale: 'en-GB' });
    inner.locale = undefined;
    expect(child.value).toMatchObject({ language: 'ru', locale: 'ru-RU' });
    outer.locale = undefined;
    expect(child.value).toMatchObject({ language: 'en', locale: 'en-US' });
  });

  it.each([
    [{ language: 'de' }, 'unsupported language'],
    [{ language: null }, 'unsupported language'],
    [{ language: { toString: (): string => 'en' } }, 'unsupported language'],
    [{ locale: 'fr-FR' }, 'unsupported locale'],
    [{ locale: 'en-AU' }, 'unsupported locale'],
    [{ locale: null }, 'unsupported locale'],
    [{ locale: { toString: (): string => 'en-US' } }, 'unsupported locale'],
    [{ translate: 'Text' }, 'translate must be a function'],
    [{ translate: null }, 'translate must be a function'],
  ])('diagnoses invalid runtime settings %j', (props, error) => {
    expect(() => resolveConfig(props as unknown as DrConfigProviderProps)).toThrow(error);
  });

  it('does not mutate defaults or inherit derived values as explicit settings', () => {
    const first = resolveConfig({ language: 'ru' });

    expect(first.explicitLocale).toBeUndefined();
    expect(resolveConfig({}, first).locale).toBe('ru-RU');
    expect(defaultConfig.value).toEqual({ language: 'en', locale: 'en-US', translators: [] });
    expect(Object.isFrozen(defaultConfig.value)).toBe(true);
    expect(Object.isFrozen(defaultConfig.value.translators)).toBe(true);
  });
});
