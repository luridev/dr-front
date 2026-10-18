import { pasteInput, readSelection, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

test('plain input keeps native editing, events, exposed methods and one model update per input', async ({ mount }) => {
  const root = await mount('forms/components/DrInput/DrInputGallery');
  const input = root.getByRole('textbox', { name: 'Name', exact: true });
  const mirror = root.getByRole('textbox', { name: 'Read-only name', exact: true });
  const updates = root.getByTestId('name-updates');

  await input.fill('text / 123');
  await expect(mirror).toHaveValue('text / 123');
  await expect(updates).toHaveText('1');
  await root.getByRole('button', { name: 'Replace name', exact: true }).click();
  await expect(input).toHaveValue('Updated by parent');
  await expect(updates).toHaveText('1');
  await expect(root.getByTestId('last-event')).toHaveText('blur');
  await root.getByRole('button', { name: 'Focus name at end' }).click();
  await expect(input).toBeFocused();
  expect(await readSelection(input)).toEqual([17, 17]);
  await input.press('!');
  await expect(root.getByTestId('last-event')).toHaveText('keydown');
  await expect(input).toHaveValue('Updated by parent!');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('Updated by parent');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue('Updated by parent!');
  await input.dispatchEvent('wheel', { deltaY: 10 });
  await expect(root.getByTestId('last-event')).toHaveText('wheel');
  await selectInputRange(input, 0, 18);
  await pasteInput(input, 'pasted text');
  await expect(input).toHaveValue('pasted text');
  await expect(mirror).toHaveValue('pasted text');
  await root.getByRole('button', { name: 'Clear name', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(mirror).toHaveValue('');
  await expect(input).toBeFocused();
});

test('plain input retains immediate model updates during composition', async ({ mount }) => {
  const root = await mount('forms/components/DrInput/DrInputGallery');
  const input = root.getByRole('textbox', { name: 'Name', exact: true });
  const mirror = root.getByRole('textbox', { name: 'Read-only name', exact: true });

  await input.focus();

  await input.evaluate((element: HTMLInputElement) => {
    element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    element.value = 'に';
    element.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'に', isComposing: true }));
  });

  await expect(mirror).toHaveValue('に');
  await expect(root.getByTestId('name-updates')).toHaveText('1');

  await input.evaluate((element: HTMLInputElement) => {
    element.value = '日本';
    element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '日本' }));
    element.dispatchEvent(new InputEvent('input', { bubbles: true, data: '日本' }));
  });

  await expect(mirror).toHaveValue('日本');
  await expect(root.getByTestId('name-updates')).toHaveText('2');
});

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
