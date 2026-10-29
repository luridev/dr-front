import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrAlert from '@/feedback/components/DrAlert/DrAlert.vue';
import type { DrAlertData } from '@/feedback/types';

describe.each(['error', 'warning', 'info'] as const)('DrAlert variant=%s', (variant) => {
  it('renders consumer content with the variant style and announcement role', async () => {
    const data: DrAlertData = {
      variant,
      title: 'Заголовок приложения',
      message: 'Подробности операции',
      note: 'Дополнительная информация',
    };

    const html = await renderToString(createSSRApp(() => h(DrAlert, data)));

    expect(html).toContain(data.title);
    expect(html).toContain(data.message);
    expect(html).toContain(data.note);
    expect(html).toContain(`DrAlert_variant_${variant}`);
    expect(html).toContain(`role="${variant === 'error' ? 'alert' : 'status'}"`);
  });
});

it('DrAlert defaults to an error alert when variant is omitted', async () => {
  const html = await renderToString(createSSRApp(() => h(DrAlert, {
    title: 'Ошибка приложения',
    message: 'Подробности операции',
  })));

  expect(html).toContain('role="alert"');
  expect(html).toContain('DrAlert_variant_error');
  expect(html).toContain('Ошибка приложения');
  expect(html).toContain('Подробности операции');
});
