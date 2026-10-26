import { expect, test } from '~/tests/playwright/fixtures';

const selectStoryId = 'forms/components/DrSelect/DrSelectGallery';

test('mobile Select at 560px focuses its listbox and returns the keyboard selection', async ({ mount, page }) => {
  await page.setViewportSize({ width: 560, height: 844 });
  const component = await mount(selectStoryId);
  const trigger = component.getByRole('combobox', { name: 'City', exact: true });
  const dialog = page.getByRole('dialog', { name: 'City', exact: true });
  const listbox = dialog.getByRole('listbox');
  await trigger.press('Enter');
  await expect(listbox).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(listbox).toBeFocused();
  await page.keyboard.press('ArrowDown');

  await expect(listbox).toHaveAttribute(
    'aria-activedescendant',
    await listbox.getByRole('option', { name: 'Paris', exact: true }).getAttribute('id') ?? '',
  );

  await page.keyboard.press('Space');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Paris');
  await expect(component.getByText('Selected city: Paris', { exact: true })).toBeVisible();
});

test('desktop Select keeps focus at 561px and follows external model changes', async ({ mount, page }) => {
  await page.setViewportSize({ width: 561, height: 844 });

  const component = await mount(selectStoryId);
  const trigger = component.getByRole('combobox', { name: 'City', exact: true });
  const listbox = page.getByRole('listbox', { name: 'City', exact: true });

  await trigger.press('Enter');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.keyboard.press('ArrowDown');

  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    await listbox.getByRole('option', { name: 'Paris', exact: true }).getAttribute('id') ?? '',
  );

  await expect(trigger).toBeFocused();
  await expect(component.getByText('Selected city: none', { exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(listbox).toHaveCount(0);
  await expect(trigger).toHaveText('Paris');
  await trigger.press('Space');
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Paris');
  await trigger.click();
  const reset = component.getByRole('button', { name: 'Reset city' });

  await reset.evaluate((button: HTMLButtonElement) => {
    button.click();
  });

  await expect(listbox).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Choose a city');
  await expect(listbox.getByRole('option', { selected: true })).toHaveCount(0);

  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    await listbox.getByRole('option').first().getAttribute('id') ?? '',
  );

  await reset.click();
  await expect(listbox).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls');
  await expect(trigger).not.toHaveAttribute('aria-activedescendant');
  const error = component.getByRole('combobox', { name: 'Error', exact: true });
  await expect(error).toHaveAttribute('aria-invalid', 'true');
  await expect(error).toHaveAccessibleDescription('Choose a delivery city.');
});
