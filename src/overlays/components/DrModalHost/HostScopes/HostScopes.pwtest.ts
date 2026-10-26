import { expect, test } from '~/tests/playwright/fixtures';
import type { Locator } from '@playwright/test';

async function command(component: Locator, name: string) {
  await component.getByRole('button', { name, exact: true }).evaluate((button: HTMLButtonElement) => {
    button.focus();
    button.click();
  });
}

const story = 'overlays/components/DrModalHost/HostScopes/HostScopes';

test('independent Vue apps and nested toast Hosts retain only their own queues across unmount/remount', async ({ mount, page }) => {
  const component = await mount(story);
  const toasts = page.locator('.DrToast');

  await command(component, 'Toast a');
  await command(component, 'Queue a');
  await command(component, 'Toast nested');
  await command(component, 'Toast b');
  await expect(toasts).toHaveCount(3);
  await expect(component.locator('.DrToast')).toHaveCount(0);
  await command(component, 'Unmount a');
  await expect(toasts).toHaveCount(1);
  await expect(toasts).toContainText('b');
  await command(component, 'Toast a');
  await expect(component.getByTestId('result')).toHaveText('0');
  await expect(toasts).toHaveCount(1);
  await command(component, 'Mount a');
  await command(component, 'Toast a');
  await expect(component.getByTestId('result')).toHaveText('1');
  await expect(toasts).toHaveCount(2);
  await component.update({});
  await expect(toasts).toHaveCount(2);
  await component.unmount();
  await expect(toasts).toHaveCount(0);
});

test('toast repeat restarts duration and hover, focus and document visibility pause the remaining time', async ({ mount, page }) => {
  const component = await mount(story);
  const toast = page.locator('.DrToast');
  const show = component.getByRole('button', { name: 'Toast a', exact: true });
  const time = new Date('2026-01-01T00:00:00Z');

  await page.clock.install({ time });
  await page.clock.pauseAt(new Date(time.getTime() + 60_000));
  await show.click();
  await page.clock.runFor(600);
  await show.click();
  await page.clock.runFor(600);
  await expect(toast).toHaveCount(1);
  await toast.hover();
  await page.clock.runFor(2000);
  await expect(toast).toHaveCount(1);
  await page.mouse.move(1000, 800);
  await page.clock.runFor(600);
  await expect(toast).toHaveCount(0);

  await show.click();
  await page.clock.runFor(500);
  await toast.getByRole('button').focus();
  await page.clock.runFor(2000);
  await expect(toast).toHaveCount(1);
  await show.focus();
  await page.clock.runFor(700);
  await expect(toast).toHaveCount(0);

  await show.click();
  await page.clock.runFor(500);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await page.clock.runFor(2000);
  await expect(toast).toHaveCount(1);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await page.clock.runFor(700);
  await expect(toast).toHaveCount(0);
});

test('document coordination preserves overflow, global stacking, focus and Escape across Hosts', async ({ mount, page }) => {
  const component = await mount(story);
  const a = page.getByRole('dialog', { name: 'Dialog a', exact: true });
  const b = page.getByRole('dialog', { name: 'Dialog b', exact: true });

  await page.evaluate(() => {
    document.body.style.setProperty('overflow', 'clip', 'important');
    document.documentElement.style.overflow = 'scroll';
  });

  await component.getByRole('button', { name: 'Trigger a', exact: true }).click();
  await expect(a).toBeFocused();
  await expect(component.getByTestId('root-a')).toHaveAttribute('inert');
  await command(component, 'Open b');
  await expect(b).toBeFocused();
  await expect(page.locator('.DrOverlayLayer[inert]')).toHaveCount(1);

  await component.getByRole('button', { name: 'Close a', exact: true }).evaluate((button: HTMLButtonElement) => {
    button.click();
  });

  await expect(b).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(component.getByTestId('root-a')).not.toHaveAttribute('inert');

  await command(component, 'Open a');
  await a.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(b).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  await expect(component.getByRole('button', { name: 'Open b', exact: true })).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'clip');
  expect(await page.locator('body').evaluate((body) => body.style.getPropertyPriority('overflow'))).toBe('important');
  await expect(page.locator('html')).toHaveCSS('overflow', 'scroll');

  await component.getByRole('button', { name: 'Trigger a', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(component.getByRole('button', { name: 'Trigger a', exact: true })).toBeFocused();
});

test('shared background ownership, original inert and Host/owner disposal do not release another modal', async ({ mount, page }) => {
  const component = await mount(story);
  const root = component.getByTestId('root-a');

  await root.evaluate((element) => {
    element.setAttribute('inert', 'original');
  });

  await command(component, 'Share background');
  await command(component, 'Open a');
  await command(component, 'Open b');
  await command(component, 'Unmount a');
  await expect(page.locator('[role="dialog"]')).toHaveCount(1);
  await expect(root).toHaveAttribute('inert', '');
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await command(component, 'Close b');
  await expect(root).toHaveAttribute('inert', 'original');
  await command(component, 'Open a');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);

  await root.evaluate((element) => {
    element.removeAttribute('inert');
  });

  await command(component, 'Mount a');
  await command(component, 'Open a');
  await command(component, 'Open nested');
  await command(component, 'Toggle owner');
  await expect(page.locator('[role="dialog"]')).toHaveCount(1);
  await command(component, 'Open a');
  await expect(page.locator('[role="dialog"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(root).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('programmatic content retains caller toast context and supports nested mobile Select and backdrop', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const component = await mount(story);

  await command(component, 'Open nested');

  const dialog = page.getByRole('dialog', { name: 'Dialog a-nested', exact: true });

  await dialog.getByRole('button', { name: 'Dialog toast' }).click();
  await expect(page.locator('.DrToast')).toContainText('dialog a-nested');
  await expect(page.locator('.DrToast button')).toHaveAttribute('tabindex', '-1');
  await dialog.getByRole('combobox', { name: 'Nested select' }).click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(2);
  await page.getByRole('dialog', { name: 'Nested select', exact: true }).getByRole('option', { name: 'two', exact: true }).click();
  await expect(dialog.getByRole('combobox')).toHaveText('two');
  await expect(dialog.getByRole('combobox')).toBeFocused();
  await page.locator('.DrOverlayLayer_top').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  await expect(page.locator('.DrToast button')).not.toHaveAttribute('tabindex', '-1');
  await command(component, 'Unmount a');
  await expect(page.locator('.DrToast')).toHaveCount(0);
});

for (const width of [320, 1280]) {
  test(`Select without a modal Host uses a working popup at ${width}px`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });

    const component = await mount(story);
    const trigger = component.getByRole('combobox', { name: 'Without Host', exact: true });
    const listbox = page.getByRole('listbox', { name: 'Without Host', exact: true });

    await trigger.click();
    await expect(listbox).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await listbox.getByRole('option', { name: 'two', exact: true }).click();
    await expect(trigger).toHaveText('two');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveText('one');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await expect(listbox).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(component.getByTestId('error')).toBeEmpty();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });
}
