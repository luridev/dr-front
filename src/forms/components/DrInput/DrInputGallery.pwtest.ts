import { maskingStoryId as storyId } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

const group = '\u00a0';

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
  await input.press('Delete');
  await expect(input).toHaveValue('Anna');

  await name.fill('Updated by parent');
  await expect(input).toHaveValue('Updated by parent');
});

test('integer string formatting preserves large values, middle edits and history', async ({ mount }) => {
  const root = await mount(storyId);
  const input = getInput(root, 'integerSlot');
  const digits = '1234567890'.repeat(40);
  await input.fill(`-${digits}`);
  expect((await input.inputValue()).replaceAll(group, '')).toBe(`-${digits}`);
  expect((await root.getByTestId('integer-model').textContent())?.replaceAll(group, '')).toBe(`-${digits}`);
  await input.press('Tab');
  await input.focus();
  expect((await input.inputValue()).replaceAll(group, '')).toBe(`-${digits}`);
  await root.update({ externalInteger: '12345678901234567890' });
  expect((await input.inputValue()).replaceAll(group, '')).toBe('12345678901234567890');
  await input.fill('123456');
  await selectInputRange(input, 1, 2);
  await input.press('9');
  await expect(input).toHaveValue(`193${group}456`);
  await input.press('Backspace');
  await expect(input).toHaveValue(`13${group}456`);
  await input.fill('123');
  await input.press('End');
  await input.press('4');
  await expect(input).toHaveValue(`1${group}234`);
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('123');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue(`1${group}234`);
  await root.locator('.DrInputMasking__integerSlot .DrInput__clearButton').click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
});
