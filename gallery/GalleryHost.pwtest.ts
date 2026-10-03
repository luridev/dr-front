import { expect, openReadyHost, test } from '~/tests/playwright/fixtures';
import type { HostWindow } from '~/gallery/types';

const selectStoryId = 'forms/components/DrSelect/DrSelectGallery';
const toastStoryId = 'feedback/toasts/components/DrToastHost/DrToastGallery';

test('catalog, URL history, theme and canvas share an interactive example', async ({ baseURL, page }) => {
  if (baseURL == null) {
    throw new Error('Gallery test requires baseURL.');
  }

  await page.setViewportSize({ width: 1280, height: 900 });

  const url = new URL(baseURL);

  url.search = '?theme=light';
  await openReadyHost(page, url.href);

  await expect(page.getByRole('link').filter({ hasText: 'DrInputMasking' })).toHaveCount(0);
  await page.getByRole('link', { name: /^DrSelect\b/ }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('story')).toBe(selectStoryId);

  await page.getByRole('combobox', { name: 'City', exact: true }).click();
  await page.getByRole('option', { name: 'Paris', exact: true }).click();
  await expect(page.getByText('Selected city: Paris', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.goBack();
  await expect(page.getByRole('link', { name: /^DrSelect\b/ })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('combobox', { name: 'City', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('link', { name: 'Canvas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dr Front', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dark mode', exact: true })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'City', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.getByRole('combobox', { name: 'City', exact: true })).toBeVisible();
});

test('unknown story shows an error and allows returning to the catalog', async ({ baseURL, page }) => {
  if (baseURL == null) {
    throw new Error('Gallery test requires baseURL.');
  }

  const url = new URL(baseURL);

  url.search = '?story=missing-example';
  await openReadyHost(page, url.href);
  await expect(page.getByRole('alert')).toContainText('missing-example');
  await page.getByRole('link', { name: 'All components', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^DrSelect\b/ })).toBeVisible();
});

test('story navigation clears toasts and mobile Select unmount restores the background', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const component = await mount(toastStoryId);

  await component.getByRole('button', { name: 'Show queue', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('First notification');

  await page.evaluate(async (story) => {
    await (window as unknown as HostWindow).mount({ story });
  }, selectStoryId);

  await expect(page.getByRole('status')).toBeEmpty();

  const trigger = page.getByRole('combobox', { name: 'City', exact: true });
  const dialog = page.getByRole('dialog', { name: 'City', exact: true });

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#gallery')).toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveAttribute('inert');
  await dialog.getByRole('option', { name: 'Paris', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Selected city: Paris', { exact: true })).toBeVisible();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await component.unmount();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('#gallery')).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await expect(component).toBeEmpty();
});
