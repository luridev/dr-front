import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';
import { createServer } from 'vite';
import type { ViteDevServer } from 'vite';
import type { createLocalizationApp } from '~/tests/localization/app.support';
import type { renderLocalization } from '~/tests/localization/ssr.support';
import type { LocalizationOptions } from '~/tests/localization/types.support';

type LocalizationWindow = Window & { localization: ReturnType<typeof createLocalizationApp> };

let server: ViteDevServer;
let render: typeof renderLocalization;
let serverHTML = '';
const moduleURL = `/@fs/${resolve('tests/localization/app.support.ts').replaceAll('\\', '/')}`;

test.beforeAll(async () => {
  server = await createServer({
    configFile: resolve('vite.gallery.config.ts'),
    server: { host: '127.0.0.1', port: 0, hmr: false },
    plugins: [{
      name: 'localization-ssr-test',
      configureServer(vite) {
        vite.middlewares.use('/localization-hydration', (_request, response) => {
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(`<!doctype html><html><head><meta charset="utf-8"></head><body><div id="hydration">${serverHTML}</div></body></html>`);
        });
      },
    }],
  });

  await server.listen();
  const module = await server.ssrLoadModule(resolve('tests/localization/ssr.support.ts')) as { renderLocalization: typeof renderLocalization };

  render = module.renderLocalization;
});

test.afterAll(async () => {
  await server.close();
});

const cases: Array<{ name: string; options: LocalizationOptions; date: string; time: string; number: string }> = [
  { name: 'providerless defaults', options: { provider: 'none' }, date: '12/31/2026', time: '11:45', number: '1,234,567' },
  { name: 'Front defaults', options: {}, date: '12/31/2026', time: '11:45', number: '1,234,567' },
  { name: 'language ru', options: { language: 'ru' }, date: '31.12.2026', time: '23:45', number: '1\u00a0234\u00a0567' },
  { name: 'locale ru-RU', options: { locale: 'ru-RU' }, date: '31.12.2026', time: '23:45', number: '1\u00a0234\u00a0567' },
  { name: 'locale en-US', options: { locale: 'en-US' }, date: '12/31/2026', time: '11:45', number: '1,234,567' },
  { name: 'Config locale en-GB', options: { provider: 'config', locale: 'en-GB' }, date: '31/12/2026', time: '23:45', number: '1,234,567' },
  { name: 'independent language and locale', options: { language: 'ru', locale: 'en-US' }, date: '12/31/2026', time: '11:45', number: '1,234,567' },
  { name: 'nested providers and translation fallback', options: { language: 'ru', locale: 'en-GB', nested: true }, date: '31/12/2026', time: '23:45', number: '1,234,567' },
];

test.use({ locale: 'de-DE', timezoneId: 'Pacific/Honolulu' });

for (const sample of cases) {
  test(`SSR and real hydration: ${sample.name}`, async ({ page }) => {
    const diagnostics: Array<string> = [];

    page.on('pageerror', (error) => {
      diagnostics.push(error.message);
    });

    page.on('console', (message) => {
      if (message.type() === 'warning' || message.type() === 'error') {
        diagnostics.push(message.text().split('\n')[0]);
      }
    });

    const result = await render(sample.options);

    expect(result.warnings).toEqual([]);
    expect(result.updates).toEqual([0, 0, 0, 0]);
    serverHTML = result.html;
    await page.goto(new URL('/localization-hydration', server.resolvedUrls?.local[0]).href);
    const number = page.getByRole('spinbutton', { name: 'Number', exact: true });
    const date = page.getByRole('textbox', { name: 'Date', exact: true });
    const time = page.getByRole('textbox', { name: 'Time', exact: true });

    await expect(number).toHaveValue(sample.number);
    await expect(date).toHaveValue(sample.date);
    await expect(time).toHaveValue(sample.time);
    const inputs = await page.locator('input').elementHandles();

    await page.evaluate(async ({ url, options }) => {
      const module = await import(url) as { createLocalizationApp: typeof createLocalizationApp };
      const localization = module.createLocalizationApp(options);

      (window as unknown as LocalizationWindow).localization = localization;
      localization.app.mount('#hydration');
    }, { url: moduleURL, options: sample.options });

    await expect(number).toHaveValue(sample.number);
    await expect(date).toHaveValue(sample.date);
    await expect(time).toHaveValue(sample.time);
    await expect(page.getByTestId('models')).toHaveAttribute('data-updates', '0,0,0,0');
    await expect(page.getByTestId('identity')).toHaveText('true,true');

    for (const input of inputs) {
      expect(await input.evaluate((element) => element.isConnected)).toBe(true);
    }

    expect(await page.evaluate(() => navigator.language)).toBe('de-DE');
    expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe('Pacific/Honolulu');

    if (sample.options.nested === true) {
      await expect(page.getByRole('button', { name: 'Custom clear (en)', exact: true })).toHaveCount(3);
    }

    await time.fill(sample.time.startsWith('23') ? '23:46' : '11:46');
    await expect(page.getByTestId('models')).toHaveText('1234567|2026-12-31|23:46:56.123456789|-1234567');
    await expect(page.getByTestId('models')).toHaveAttribute('data-updates', '0,0,1,0');

    if (sample.name === 'independent language and locale') {
      await page.evaluate(() => {
        (window as unknown as LocalizationWindow).localization.state.locale = 'ru-RU';
      });

      await expect(number).toHaveValue('1\u00a0234\u00a0567');
      await expect(date).toHaveValue('31.12.2026');
      await expect(time).toHaveValue('23:46');
      await expect(page.getByRole('textbox', { name: 'Masked integer' })).toHaveValue('-1\u00a0234\u00a0567');
      await expect(page.getByTestId('models')).toHaveAttribute('data-updates', '0,0,1,0');

      await page.evaluate(() => {
        (window as unknown as LocalizationWindow).localization.state.locale = 'en-US';
      });

      await page.getByRole('button', { name: 'Переключить поле «Time» на AM', exact: true }).click();
      await expect(page.getByTestId('models')).toHaveText('1234567|2026-12-31|11:46:56.123456789|-1234567');
    }

    expect(diagnostics).toEqual([]);
  });
}
