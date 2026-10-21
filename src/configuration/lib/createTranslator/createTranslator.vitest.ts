import { describe, expect, it, vi } from 'vitest';
import { computed, reactive, ref } from 'vue';
import { dictionaries } from '@/configuration/config';
import { createTranslator } from '@/configuration/lib/createTranslator/createTranslator';
import { resolveConfig } from '@/configuration/lib/resolveConfig/resolveConfig';
import { en } from '@/configuration/messages/en';
import { ru } from '@/configuration/messages/ru';
import type { DrConfigProviderProps, DrTranslateOverride } from '@/configuration/types';

describe('translations', () => {
  it('has complete dictionaries of reusable functions', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort());

    for (const dictionary of Object.values(dictionaries)) {
      expect(Object.isFrozen(dictionary)).toBe(true);

      for (const message of Object.values(dictionary)) {
        expect(message).toBeTypeOf('function');
      }
    }
  });

  it.each([
    ['en', 'Close', 'Clear $& {name} <b>Email</b>'],
    ['ru', 'Закрыть', 'Очистить поле «$& {name} <b>Email</b>»'],
  ] as const)('calls ordinary and parameterized %s messages', (language, close, clear) => {
    const t = createTranslator(computed(() => resolveConfig({ language })));

    expect(t('dialog.close')).toBe(close);
    expect(t('input.clearNamed', { label: '$& {name} <b>Email</b>' })).toBe(clear);
  });

  it('rejects unknown runtime keys before invoking application callbacks', () => {
    const translate = vi.fn<DrTranslateOverride>(() => 'Application text');
    const t = createTranslator(computed(() => resolveConfig({ translate })));

    expect(() => {
      Reflect.apply(t, undefined, ['unknown.key']);
    }).toThrow('unknown message "unknown.key"');

    expect(translate).not.toHaveBeenCalled();
  });

  it('passes the current request and falls back without artificial params for ordinary messages', () => {
    const translate = vi.fn<DrTranslateOverride>((request) => request.key === 'input.clearNamed'
      ? `Reset ${request.params.label}`
      : undefined);

    const t = createTranslator(computed(() => resolveConfig({ language: 'ru', translate })));

    expect(t('input.clearNamed', { label: 'Email' })).toBe('Reset Email');
    expect(translate).toHaveBeenLastCalledWith({ language: 'ru', key: 'input.clearNamed', params: { label: 'Email' } });
    expect(t('dialog.close')).toBe('Закрыть');
    expect(translate).toHaveBeenLastCalledWith({ language: 'ru', key: 'dialog.close' });
    expect(translate).toHaveBeenCalledTimes(2);
  });

  it('resolves nearest callbacks first, stops at any string and reaches ancestors or built-ins on undefined', () => {
    const grandparent = vi.fn<DrTranslateOverride>((request) => request.key === 'input.clearNamed'
      ? `Outer ${request.params.label}`
      : undefined);

    const parent = vi.fn<DrTranslateOverride>(({ key }) => key === 'dialog.close' ? 'Parent close' : undefined);
    const child = vi.fn<DrTranslateOverride>(({ key }) => key === 'toast.error' ? '' : undefined);

    const context = computed(() => resolveConfig({ translate: child },
      resolveConfig({ translate: parent }, resolveConfig({ translate: grandparent }))));

    const t = createTranslator(context);

    expect(t('dialog.close')).toBe('Parent close');
    expect(child).toHaveBeenCalledTimes(1);
    expect(parent).toHaveBeenCalledTimes(1);
    expect(grandparent).not.toHaveBeenCalled();
    expect(child.mock.invocationCallOrder[0]).toBeLessThan(parent.mock.invocationCallOrder[0]);
    expect(t('input.clearNamed', { label: 'Email' })).toBe('Outer Email');
    expect(child).toHaveBeenCalledTimes(2);
    expect(parent).toHaveBeenCalledTimes(2);
    expect(grandparent).toHaveBeenCalledTimes(1);
    expect(parent.mock.invocationCallOrder[1]).toBeLessThan(grandparent.mock.invocationCallOrder[0]);
    expect(t('filePicker.choose')).toBe('Choose file');
    expect(grandparent).toHaveBeenCalledTimes(2);
    expect(t('toast.error')).toBe('');
    expect(child).toHaveBeenCalledTimes(4);
    expect(parent).toHaveBeenCalledTimes(3);
    expect(grandparent).toHaveBeenCalledTimes(2);
  });

  it('does not repeat the same callback reused in nested providers', () => {
    const translate = vi.fn<DrTranslateOverride>(() => undefined);
    const context = computed(() => resolveConfig({ translate }, resolveConfig({ translate })));
    const t = createTranslator(context);

    expect(t('dialog.close')).toBe('Close');
    expect(translate).toHaveBeenCalledTimes(1);
  });

  it('reacts to replacement and reset of child and ancestor callbacks', () => {
    const outer = reactive<DrConfigProviderProps>({
      translate: ({ key }) => key === 'dialog.close' ? 'Parent close' : undefined,
    });

    const inner = reactive<DrConfigProviderProps>({
      translate: ({ key }) => key === 'dialog.close' ? 'Child close' : undefined,
    });

    const parent = computed(() => resolveConfig(outer));
    const t = createTranslator(computed(() => resolveConfig(inner, parent.value)));
    const close = computed(() => t('dialog.close'));

    expect(close.value).toBe('Child close');
    inner.translate = () => 'Replacement';
    expect(close.value).toBe('Replacement');
    inner.translate = () => undefined;
    expect(close.value).toBe('Parent close');
    inner.translate = undefined;
    expect(close.value).toBe('Parent close');
    outer.translate = () => 'New parent';
    expect(close.value).toBe('New parent');
    outer.translate = undefined;
    expect(close.value).toBe('Close');
  });

  it('tracks callback dependencies, message parameters and the resolved child language', () => {
    const prefix = ref('Reset');
    const label = ref('Email');

    const outer = reactive<DrConfigProviderProps>({
      language: 'en',
      translate: ({ language, key, params }) => language === 'en' && key === 'input.clearNamed'
        ? `${prefix.value} ${params.label}`
        : undefined,
    });

    const inner = reactive<DrConfigProviderProps>({ language: 'ru' });
    const parent = computed(() => resolveConfig(outer));
    const t = createTranslator(computed(() => resolveConfig(inner, parent.value)));
    const clear = computed(() => t('input.clearNamed', { label: label.value }));

    expect(clear.value).toBe('Очистить поле «Email»');
    inner.language = undefined;
    expect(clear.value).toBe('Reset Email');
    prefix.value = 'Erase';
    label.value = 'Name';
    expect(clear.value).toBe('Erase Name');
    outer.language = 'ru';
    expect(clear.value).toBe('Очистить поле «Name»');
  });
});
