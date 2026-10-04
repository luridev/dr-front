import { expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrFilePickerButton from '@/forms/components/DrFilePickerButton/DrFilePickerButton.vue';

it('DrFilePickerButton preserves the inner button loading state', async () => {
  const html = await renderToString(createSSRApp(() => h(DrFilePickerButton, { loading: true })));
  const button = /<button\b[^>]*>/.exec(html)?.[0];

  expect(button).toContain('DrButton_loading');
  expect(button).toContain('aria-busy="true"');
  expect(button).toMatch(/\sdisabled(?:\s|>)/);
});
