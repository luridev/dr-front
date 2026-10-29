import { describe, expect, it, vi } from 'vitest';
import { createSSRApp, h, readonly, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrFrontProvider from '@/configuration/components/DrFrontProvider/DrFrontProvider.vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import type { DrSelectItemSlotProps } from '@/forms/components/DrSelect/types';
import type { SelectGalleryItem } from '@/forms/components/DrSelect/types.support';

describe('DrSelect SSR', () => {
  it('resolves a readonly reactive model to its raw item in the trigger slot', async () => {
    const items = [{ id: 1 }, { id: 1 }];
    const modelValue = readonly(ref(items[1]).value);
    const update = vi.fn();
    const renderItem = vi.fn((slot: DrSelectItemSlotProps<SelectGalleryItem>) => h('span', String(slot.index)));

    await renderToString(createSSRApp(() => h(DrSelect<SelectGalleryItem>, {
      items,
      modelValue,
      'onUpdate:modelValue': update,
    }, { item: renderItem })));

    expect(renderItem.mock.calls[0]?.[0]).toMatchObject({ index: 1, selected: true });
    expect(renderItem.mock.calls[0]?.[0].item).toBe(modelValue);
    expect(update).not.toHaveBeenCalled();
  });

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
