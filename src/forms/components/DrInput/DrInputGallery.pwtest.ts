import { expect, test } from '~/tests/playwright/fixtures';

test('read-only input remains focusable and selectable and follows parent updates', async ({ mount, page }) => {
  const component = await mount('forms/components/DrInput/DrInputGallery');
  const input = component.getByRole('textbox', { name: 'Read-only name', exact: true });
  const name = component.getByRole('textbox', { name: 'Name', exact: true });

  await expect(name).toBeEditable();
  await expect(input).toBeEnabled();
  await expect(input).not.toBeEditable();
  await expect(component.getByRole('button', { name: 'Clear read-only name' })).toHaveCount(0);
  await expect(component.getByRole('textbox', { name: 'Disabled', exact: true })).toBeDisabled();

  await component.getByRole('button', { name: 'Clear name', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  await input.press('ControlOrMeta+A');

  expect(await input.evaluate((element: HTMLInputElement) =>
    element.value.slice(element.selectionStart ?? 0, element.selectionEnd ?? 0),
  )).toBe('Anna');

  await input.pressSequentially('Changed');
  await input.press('Backspace');
  await expect(input).toHaveValue('Anna');

  await name.fill('Updated by parent');
  await expect(input).toHaveValue('Updated by parent');
});
