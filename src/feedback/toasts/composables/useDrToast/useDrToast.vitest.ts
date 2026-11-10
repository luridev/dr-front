import { describe, expect, it } from 'vitest';
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { DrButton, DrInput, DrToastHost, DrModalHost, useDrToast } from '@/index';
import type { DrToastService } from '@/feedback/toasts/types';

describe('Host providers during SSR', () => {
  it('renders default slots without a DOM wrapper or DOM access and isolates nested/sibling/request services', async () => {
    const services: Array<DrToastService> = [];

    const Child = defineComponent({
      setup() {
        const toast = useDrToast();

        services.push(toast);
        expect(toast.info({ message: 'created in setup' })).toBe(1);

        return () => h('span', 'content');
      },
    });

    const App = () => [
      h(DrToastHost, null, { default: () => [
        h(Child),
        h(DrModalHost, { backgroundRoot: null }, { default: () => h(DrToastHost, null, { default: () => h(Child) }) }),
      ] }),
      h(DrToastHost, null, { default: () => h(Child) }),
    ];

    const markup = await renderToString(createSSRApp(App));

    expect(markup.replace(/<!--.*?-->/g, '')).toBe('<span>content</span>'.repeat(3));
    await renderToString(createSSRApp(App));
    expect(new Set(services).size).toBe(6);
    await Promise.resolve();
    expect(services[0].success({ message: 'after await' })).toBeGreaterThan(0);
  });

  it('reports missing setup/Host but ordinary components render without initialization', async () => {
    expect(() => useDrToast()).toThrow('synchronously during setup');

    const Child = defineComponent({ setup() {
      useDrToast();

      return () => null;
    } });

    const app = createSSRApp(Child);

    app.config.warnHandler = () => undefined;
    await expect(renderToString(app)).rejects.toThrow('ancestor <DrToastHost>');
    const html = await renderToString(createSSRApp(() => [h(DrButton, null, () => 'Button'), h(DrInput, { modelValue: '' })]));

    expect(html).toContain('Button');
    expect(html).toContain('<input');
  });
});
