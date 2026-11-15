import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrTabSwitcher from '@/navigation/tabs/components/DrTabSwitcher/DrTabSwitcher.vue';

function renderTabs(items: ReadonlyArray<string>) {
  return renderToString(createSSRApp(() => h(DrTabSwitcher<string>, {
    id: 'sections',
    items,
    modelValue: 'B',
    aria: { ariaLabel: 'Sections' },
  })));
}

describe('DrTabSwitcher SSR', () => {
  it('renders the same tabs, selection and roving tabindex for dense and sparse arrays', async () => {
    const sparse = new Array<string>(6);

    sparse[1] = 'A';
    sparse[4] = 'B';

    const denseMarkup = await renderTabs(['A', 'B']);
    const sparseMarkup = await renderTabs(sparse);

    expect(denseMarkup.match(/role="tab"/gu)).toHaveLength(2);
    expect(denseMarkup).toMatch(/id="sections-tab-A"[^>]*aria-selected="false"[^>]*tabindex="-1"/u);
    expect(denseMarkup).toMatch(/id="sections-tab-B"[^>]*aria-selected="true"[^>]*tabindex="0"/u);
    expect(sparseMarkup).toBe(denseMarkup);
  });
});
