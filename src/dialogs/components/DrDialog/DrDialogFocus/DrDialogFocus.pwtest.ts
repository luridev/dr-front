import { expect, test } from '~/tests/playwright/fixtures';

const story = 'dialogs/components/DrDialog/DrDialogFocus/DrDialogFocus';

test('explicit opener is not focused before opening; initial focus, Tab cycle and return are preserved', async ({ mount, page }) => {
  const root = await mount(story);
  const target = root.getByRole('button', { name: 'Return target', exact: true });

  await target.evaluate((element) => {
    element.dataset.focusCount = '0';

    element.addEventListener('focus', () => {
      element.dataset.focusCount = String(Number(element.dataset.focusCount) + 1);
    });
  });

  await root.getByRole('button', { name: 'Open with explicit target' }).click();
  const dialog = page.getByRole('dialog', { name: 'Dialog 1', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused();
  await expect(target).toHaveAttribute('data-focus-count', '0');
  await expect(page.locator('#gallery')).toHaveAttribute('inert');
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Last action' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  const scroll = await page.evaluate(() => scrollY);
  await page.keyboard.press('Escape');
  await expect(target).toBeFocused();
  await expect(target).toHaveAttribute('data-focus-count', '1');
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await expect(page.locator('#gallery')).not.toHaveAttribute('inert');
});

test('legacy keyboard opener restores focus-visible; a removed explicit target is safe', async ({ mount, page }) => {
  const root = await mount(story);
  const opener = root.getByRole('button', { name: 'Open from current focus' });
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  expect(await opener.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await root.getByRole('button', { name: 'Open with explicit target' }).click();

  await root.getByRole('button', { name: 'Return target' }).evaluate((element) => {
    element.remove();
  });

  await page.keyboard.press('Escape');
  await opener.focus();
  await expect(opener).toBeFocused();
});

test('a nested dialog closes the popup and returns to its trigger', async ({ mount, page }) => {
  const root = await mount(story);
  await root.getByRole('button', { name: 'Open with explicit target' }).click();
  const first = page.getByRole('dialog', { name: 'Dialog 1', exact: true });
  const trigger = first.getByRole('combobox', { name: 'Choice' });
  await trigger.click();
  await expect(trigger).toBeFocused();

  await first.getByRole('button', { name: 'Open nested dialog' }).evaluate((button: HTMLButtonElement) => {
    button.click();
  });

  const nested = page.getByRole('dialog', { name: 'Dialog 2', exact: true });
  await expect(nested.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.locator('.DrOverlayLayer[inert]')).toHaveCount(1);
  const nestedSelect = nested.getByRole('combobox');
  await nestedSelect.click();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(nestedSelect).toHaveText('Beta');
  await expect(nestedSelect).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nested).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press('Enter');
  await page.keyboard.press('Escape');
  await expect(first).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(root.getByRole('button', { name: 'Return target' })).toBeFocused();
});

test('DOM removal and owner disposal release focus and allow a fresh opening', async ({ mount, page }) => {
  const errors: Array<string> = [];
  page.on('pageerror', (error) => errors.push(error.message));

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  const root = await mount(story);
  await root.getByRole('button', { name: 'Open with explicit target' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Temporary field (Delete)' }).press('Delete');
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await dialog.getByRole('combobox').click();
  await expect(dialog.getByRole('listbox')).toBeVisible();
  await root.unmount();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.locator('#gallery')).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1200, height: 800 });
  await root.update();
  const opener = root.getByRole('button', { name: 'Open from current focus' });
  await opener.press('Enter');
  await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  expect(errors).toEqual([]);
});
