import { describe, expect, it, vi } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrFrontProvider from '@/configuration/components/DrFrontProvider/DrFrontProvider.vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';

describe('DrSelect SSR', () => {
  it.each([false, true])('renders a closed Select without browser globals (provider: %s)', async (withProvider) => {
    const update = vi.fn();

    const select = () => h(DrSelect<string>, {
      label: 'SSR select',
      items: ['one', 'two'],
      modelValue: 'one',
      'onUpdate:modelValue': update,
    });

    const app = createSSRApp(() => withProvider
      ? h(DrFrontProvider, { backgroundRoot: null }, { default: select })
      : select());

    const html = await renderToString(app);

    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('role="listbox"');
    expect(update).not.toHaveBeenCalled();
  });
});
