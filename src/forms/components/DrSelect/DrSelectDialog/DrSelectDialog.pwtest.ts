import { standardDesktopViewport } from '~/tests/playwright/config';
import { expect, test } from '~/tests/playwright/fixtures';

const selectDialogStoryId = 'forms/components/DrSelect/DrSelectDialog/DrSelectDialog';

for (const focusTarget of ['trigger', 'listbox'] as const) {
  test(`Escape with focus=${focusTarget} closes the select, then the dialog`, async ({ mount, page }) => {
    await page.setViewportSize(standardDesktopViewport);

    const component = await mount(selectDialogStoryId);
    const dialog = page.getByRole('dialog');
    const trigger = dialog.getByRole('combobox');
    const listbox = dialog.getByRole('listbox');

    await component.getByRole('button', { name: 'Open dialog', exact: true }).click();
    await trigger.click();
    await expect(listbox).toBeVisible();

    if (focusTarget === 'listbox') {
      await listbox.focus();
    }

    await expect(focusTarget === 'listbox' ? listbox : trigger).toBeFocused();
    await page.keyboard.press('Escape');

    await expect(listbox).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
}

test('nested mobile Select keeps Tab navigation within the topmost dialog', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const component = await mount(selectDialogStoryId);
  const outerDialog = page.getByRole('dialog', { name: 'Select dialog', exact: true });
  const trigger = outerDialog.getByRole('combobox', { name: 'Dialog select', exact: true });
  const innerDialog = page.getByRole('dialog', { name: 'Dialog select', exact: true });
  const listbox = innerDialog.getByRole('listbox');
  const innerClose = innerDialog.getByRole('button', { name: 'Закрыть', exact: true });

  await component.getByRole('button', { name: 'Open dialog', exact: true }).click();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(listbox).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(innerClose).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(listbox).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(innerDialog).toHaveCount(0);
  await expect(outerDialog).toBeVisible();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(outerDialog).toHaveCount(0);
});
