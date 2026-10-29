import { describe, expect, it } from 'vitest';
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrConfigProvider from '@/configuration/components/DrConfigProvider/DrConfigProvider.vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import DrInput from '@/forms/components/DrInput/DrInput.vue';

const Probe = defineComponent({
  setup() {
    const config = useDrConfig();
    const t = useDrTranslation();

    return () => h('span', `${config.value.language}/${config.value.locale}/${t('dialog.close')}`);
  },
});

describe('DrConfigProvider SSR', () => {
  it('passes the resolved child language through nested callback fallbacks', async () => {
    const html = await renderToString(createSSRApp(() => h(DrConfigProvider, {
      language: 'ru',
      translate: ({ language, key }) => key === 'dialog.close' ? `Parent ${language}` : undefined,
    }, {
      default: () => h(DrConfigProvider, { language: 'en', translate: () => undefined }, {
        default: () => [h(Probe), h(DrConfigProvider, { translate: () => '' }, { default: () => h(Probe) })],
      }),
    })));

    expect(html).toContain('<span>en/en-US/Parent en</span>');
    expect(html).toContain('<span>en/en-US/</span>');
  });

  it('renders slots without a DOM wrapper and preserves explicit ancestor settings', async () => {
    const html = await renderToString(createSSRApp(() => h(DrConfigProvider, { locale: 'ru-RU' }, {
      default: () => h(DrConfigProvider, { language: 'en' }, { default: () => h(Probe) }),
    })));

    expect(html.replace(/<!--[\s\S]*?-->/g, '')).toBe('<span>en/ru-RU/Close</span>');
  });

  it('keeps concurrent apps independent and leaves providerless components on defaults', async () => {
    const [russian, english, plain] = await Promise.all([
      renderToString(createSSRApp(() => h(DrConfigProvider, { language: 'ru' }, {
        default: () => h(DrInput, { modelValue: 'abc', label: 'Email' }),
      }))),
      renderToString(createSSRApp(() => h(DrConfigProvider, { locale: 'en-GB' }, { default: () => h(Probe) }))),
      renderToString(createSSRApp(Probe)),
    ]);

    expect(russian).toContain('Очистить поле «Email»');
    expect(english).toContain('en/en-GB/Close');
    expect(plain).toContain('en/en-US/Close');
  });
});
