import { expect, test } from '~/tests/playwright/fixtures';

test('independent radio groups retain native names, arrow boundaries and Tab navigation', async ({ mount, page }) => {
  const component = await mount('forms/components/DrRadioGroup/DrRadioGroupGallery');
  const row = component.getByRole('radiogroup', { name: 'Row', exact: true });
  const column = component.getByRole('radiogroup', { name: 'Column', exact: true });
  const rowRadios = row.getByRole('radio');
  const columnRadios = column.getByRole('radio');
  const rowName = await rowRadios.first().getAttribute('name');
  const columnName = await columnRadios.first().getAttribute('name');

  expect(rowName).toBeTruthy();
  expect(columnName).toBeTruthy();
  expect(rowName).not.toBe(columnName);

  await rowRadios.first().focus();
  await page.keyboard.press('ArrowLeft');
  await expect(rowRadios.last()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(rowRadios.first()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(rowRadios.nth(1)).toBeChecked();
  await expect(columnRadios.nth(1)).toBeChecked();

  await page.keyboard.press('Tab');
  await expect(columnRadios.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(columnRadios.last()).toBeChecked();
  await expect(rowRadios.nth(1)).toBeChecked();
  await page.keyboard.press('Shift+Tab');
  await expect(rowRadios.nth(1)).toBeFocused();
  await expect(component.getByText('Row: Pickup point · Column: In store', { exact: true })).toBeVisible();
});
