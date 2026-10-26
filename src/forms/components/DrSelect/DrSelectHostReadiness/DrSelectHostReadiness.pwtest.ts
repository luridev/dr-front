import { expect, test } from '~/tests/playwright/fixtures';

const story = 'forms/components/DrSelect/DrSelectHostReadiness/DrSelectHostReadiness';

test('a late background root preserves the mobile popup and selection until the next opening', async ({ mount, page }) => {
  await page.setViewportSize({ width: 320, height: 480 });

  const component = await mount(story, { ready: false });
  const trigger = component.getByRole('combobox', { name: 'Ready select' });
  const popup = page.getByRole('listbox', { name: 'Ready select', exact: true });

  await trigger.click();
  await expect(popup).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(component.getByTestId('background')).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

  const bounds = await popup.boundingBox();

  expect(bounds).not.toBeNull();
  expect(bounds?.x).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(320);
  expect(await popup.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);

  await component.update({ ready: true });
  await expect(popup).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await popup.getByRole('option', { name: 'Option 20 with a longer label', exact: true }).click();
  await expect(trigger).toHaveText('Option 20 with a longer label');
  await expect(trigger).toBeFocused();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Ready select' });

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('option', { name: 'Option 20 with a longer label', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(component.locator('.DrSelect__popup')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('losing the background root closes the modal, releases resources and allows a fresh opening', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const component = await mount(story, { ready: true });
  const trigger = component.getByRole('combobox', { name: 'Ready select' });
  const dialog = page.getByRole('dialog', { name: 'Ready select' });
  const background = component.getByTestId('background');

  await page.locator('body').evaluate((body) => {
    body.style.setProperty('overflow', 'clip', 'important');
  });

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(background).toHaveAttribute('inert', '');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await component.update({ ready: false });
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await expect(background).not.toHaveAttribute('inert');
  await expect(page.locator('body')).toHaveCSS('overflow', 'clip');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await expect(trigger).toHaveText('Option 1 with a longer label');

  await trigger.click();
  await page.getByRole('option', { name: 'Option 2 with a longer label', exact: true }).click();
  await expect(trigger).toHaveText('Option 2 with a longer label');
  await component.update({ ready: true });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await component.unmount();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('body')).toHaveCSS('overflow', 'clip');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});
