import { describe, expect, it } from 'vitest';
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrConfigProvider from '@/configuration/components/DrConfigProvider/DrConfigProvider.vue';
import DrFrontProvider from '@/configuration/components/DrFrontProvider/DrFrontProvider.vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import { useDrToast } from '@/feedback/toasts/composables/useDrToast/useDrToast';

const Probe = defineComponent({
  setup() {
    const config = useDrConfig();
    const t = useDrTranslation();

    useDrToast();

    return () => h('span', `${config.value.language}/${config.value.locale}/${t('dialog.close')}`);
  },
});

describe('DrFrontProvider composition', () => {
  it('renders its SSR slot without a DOM wrapper and provides defaults and toast access', async () => {
    const html = await renderToString(createSSRApp(() => h(DrFrontProvider, null, {
      default: () => h(Probe),
    })));

    expect(html.replace(/<!--[\s\S]*?-->/g, '')).toBe('<span>en/en-US/Close</span>');
  });

  it('inherits language, locale and translation from the parent when no props are supplied', async () => {
    const html = await renderToString(createSSRApp(() => h(DrConfigProvider, {
      language: 'ru',
      locale: 'en-GB',
      translate: ({ language, key }) => key === 'dialog.close' ? `Parent ${language}` : undefined,
    }, {
      default: () => h(DrFrontProvider, null, { default: () => h(Probe) }),
    })));

    expect(html.replace(/<!--[\s\S]*?-->/g, '')).toBe('<span>ru/en-GB/Parent ru</span>');
  });

  it('forwards configuration, preserves an explicit ancestor locale and permits nested overrides', async () => {
    const html = await renderToString(createSSRApp(() => h(DrConfigProvider, { locale: 'en-GB' }, {
      default: () => h(DrFrontProvider, {
        backgroundRoot: null,
        language: 'ru',
        translate: ({ language, key }) => key === 'dialog.close' ? `Front ${language}` : undefined,
      }, {
        default: () => [h(Probe), h(DrConfigProvider, {
          language: 'en',
          locale: 'ru-RU',
          translate: ({ language, key }) => key === 'dialog.close' ? `Nested ${language}` : undefined,
        }, { default: () => h(Probe) })],
      }),
    })));

    expect(html.replace(/<!--[\s\S]*?-->/g, '')).toBe('<span>ru/en-GB/Front ru</span><span>en/ru-RU/Nested en</span>');
  });
});
