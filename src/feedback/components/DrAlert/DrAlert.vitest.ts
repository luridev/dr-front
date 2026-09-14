import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrAlert from '@/feedback/components/DrAlert/DrAlert.vue';
import { defaultDrAlertTitle } from '@/feedback/config';
import type { DrAlertData } from '@/feedback/types';

describe.each(['error', 'warning', 'info'] as const)('DrAlert variant=%s', (variant) => {
  it('подставляет текущий default для data без title', async () => {
    const data: DrAlertData = { variant, message: 'Подробности операции' };
    const html = await renderToString(createSSRApp(() => h(DrAlert, data)));

    expect(html).toContain(defaultDrAlertTitle);
    expect(html).toContain(data.message);
  });

  it('сохраняет явный consumer title', async () => {
    const title = 'Заголовок приложения';

    const html = await renderToString(createSSRApp(() => h(DrAlert, {
      variant,
      title,
      message: 'Подробности операции',
    })));

    expect(html).toContain(title);
    expect(html).not.toContain(defaultDrAlertTitle);
  });

  it('не заменяет явно пустой title default-значением', async () => {
    const html = await renderToString(createSSRApp(() => h(DrAlert, {
      variant,
      title: '',
      message: 'Подробности операции',
    })));

    expect(html).not.toContain(defaultDrAlertTitle);
    expect(html).toContain('Подробности операции');
  });
});

it('DrAlert без variant и title остаётся error alert', async () => {
  const html = await renderToString(createSSRApp(() => h(DrAlert, {
    message: 'Подробности операции',
  })));

  expect(html).toContain('role="alert"');
  expect(html).toContain(defaultDrAlertTitle);
});
