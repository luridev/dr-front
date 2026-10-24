import assert from 'node:assert/strict';
import { preview } from 'vite';

const { chromium, expect } = await import(process.argv[2]);
const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: false } });
let browser;

try {
  browser = await chromium.launch();
  const page = await browser.newPage({ locale: 'de-DE', timezoneId: 'Pacific/Honolulu' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(server.resolvedUrls.local[0]);
  const nativeNumber = page.getByRole('textbox', { name: 'Native number', exact: true });
  await expect(nativeNumber).toHaveValue('5');
  await expect(page.locator('#native-number-model')).toHaveText('5');
  await expect(page.locator('#native-number-updates')).toHaveText('1');
  await page.getByRole('button', { name: 'Set native number', exact: true }).click();
  await expect(nativeNumber).toHaveValue('5');
  await expect(page.locator('#native-number-model')).toHaveText('5');
  await expect(page.locator('#native-number-updates')).toHaveText('2');
  const date = page.getByRole('textbox', { name: 'Date', exact: true });
  const time = page.getByRole('textbox', { name: 'Time', exact: true });
  const number = page.getByRole('spinbutton', { name: 'Number', exact: true });
  const models = page.locator('#models');
  const updates = page.locator('#updates');

  for (const input of [page.getByRole('textbox', { name: 'Text', exact: true }), date, page.getByRole('textbox', { name: 'Code', exact: true })]) {
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input.locator('..')).not.toHaveClass(/DrControl__control_error/);
  }
  await expect(time).not.toHaveAttribute('aria-invalid', 'true');
  await expect(time.locator('..')).toHaveClass(/DrControl__control_error/);
  await expect(number).not.toHaveAttribute('aria-invalid', 'true');
  await expect(number).toHaveAttribute('aria-valuenow', '1234567');
  await expect(number).toHaveAttribute('aria-valuemax', '10');
  await expect(page.locator('#number-status')).toHaveText('valid');

  for (const [locale, dateText, timeText, numberText] of [
    ['en-US', '12/31/2026', '11:45', '1,234,567'],
    ['ru-RU', '31.12.2026', '23:45', '1\u00a0234\u00a0567'],
    ['en-GB', '31/12/2026', '23:45', '1,234,567'],
  ]) {
    await page.getByRole('combobox', { name: 'Locale' }).selectOption(locale);
    await expect(date).toHaveValue(dateText);
    await expect(time).toHaveValue(timeText);
    await expect(number).toHaveValue(numberText);
    await expect(models).toHaveText('2026-12-31|23:45:56.123456789|1234567');
    await expect(updates).toHaveText('0');
  }

  await page.getByRole('combobox', { name: 'Locale' }).selectOption('en-US');
  const period = page.getByRole('button', { name: 'Переключить поле «Time» на AM', exact: true });
  await expect(period).toHaveText('PM');
  assert.equal(await period.evaluate(element => getComputedStyle(element).minWidth), '44px');
  await period.click();
  await expect(models).toHaveText('2026-12-31|11:45:56.123456789|1234567');
  await expect(updates).toHaveText('1');
  await date.fill('02292024');
  await expect(date).toHaveValue('02/29/2024');
  await number.fill('-12345');
  await expect(number).toHaveValue('-12,345');
  await expect(models).toHaveText('2024-02-29|11:45:56.123456789|-12345');
  const code = page.getByRole('textbox', { name: 'Code', exact: true });
  await code.fill('123456');
  await expect(code).toHaveValue('123-456');
  const digits = page.getByRole('textbox', { name: 'Digits', exact: true });
  await digits.fill('001234567890');
  await expect(digits).toHaveValue('001234567890');
  const serial = page.getByRole('textbox', { name: 'Serial', exact: true });
  await serial.fill('CD5678');
  await expect(serial).toHaveValue('CD-5678');
  const repeated = page.getByRole('textbox', { name: 'Repeated', exact: true });
  await repeated.fill('98765');
  await expect(repeated).toHaveValue('98765');
  await expect(page.locator('#masked-models')).toHaveText('123456|001234567890|CD5678|98765');
  await page.getByRole('button', { name: 'Feedback', exact: true }).click();
  await expect(page.getByText('Package consumer notification', { exact: true })).toBeVisible();
  assert.deepEqual(errors, []);
  process.stdout.write(`[browser] installed package: 3 locales, model preservation, ARIA overrides, AM/PM, precision, edits, toast and CSS (Chromium ${browser.version()})\n`);
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}
