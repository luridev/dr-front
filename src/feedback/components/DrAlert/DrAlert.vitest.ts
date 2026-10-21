import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { en } from '@/configuration/messages/en';
import DrAlert from '@/feedback/components/DrAlert/DrAlert.vue';
import type { DrAlertData } from '@/feedback/types';

describe.each(['error', 'warning', 'info'] as const)('DrAlert variant=%s', (variant) => {
  it('uses the current default when data has no title', async () => {
    const data: DrAlertData = { variant, message: 'Подробности операции' };
    const html = await renderToString(createSSRApp(() => h(DrAlert, data)));

    expect(html).toContain(en['alert.error']());
    expect(html).toContain(data.message);
  });

  it('preserves an explicit consumer title', async () => {
    const title = 'Заголовок приложения';

    const html = await renderToString(createSSRApp(() => h(DrAlert, {
      variant,
      title,
      message: 'Подробности операции',
    })));

    expect(html).toContain(title);
    expect(html).not.toContain(en['alert.error']());
  });

  it('does not replace an explicitly empty title with the default', async () => {
    const html = await renderToString(createSSRApp(() => h(DrAlert, {
      variant,
      title: '',
      message: 'Подробности операции',
    })));

    expect(html).not.toContain(en['alert.error']());
    expect(html).toContain('Подробности операции');
  });
});

it('DrAlert remains an error alert when variant and title are omitted', async () => {
  const html = await renderToString(createSSRApp(() => h(DrAlert, {
    message: 'Подробности операции',
  })));

  expect(html).toContain('role="alert"');
  expect(html).toContain(en['alert.error']());
});
