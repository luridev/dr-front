import { standardDesktopViewport } from '~/tests/playwright/config';
import { expect, test } from '~/tests/playwright/fixtures';

const selectDialogStoryId = 'forms/components/DrSelect/DrSelectDialog/DrSelectDialog';

for (const focusTarget of ['trigger', 'listbox'] as const) {
  test(`Escape с focus=${focusTarget} закрывает select, затем dialog`, async ({ mount, page }) => {
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
