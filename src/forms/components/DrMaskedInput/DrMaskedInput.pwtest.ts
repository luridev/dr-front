import { selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { integerMask, maskedInputStoryId as storyId } from '@/forms/components/DrMaskedInput/config.support';
import { expect, test } from '~/tests/playwright/fixtures';

test('multiple mask instances edit independently', async ({ mount }) => {
  const root = await mount(storyId);
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  const serial = root.getByRole('textbox', { name: 'Serial', exact: true });
  const integer = root.getByRole('textbox', { name: 'Integer', exact: true });
  await input.fill('123456');
  await serial.fill('CD5678');
  await integer.fill('-42');
  await expect(input).toHaveValue('123-456');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await expect(serial).toHaveValue('CD-5678');
  await expect(root.getByTestId('serial-model')).toHaveText('CD5678');
  await expect(integer).toHaveValue('-42');
  await expect(root.getByTestId('integer-model')).toHaveText('-42');
});

test('external canonical updates and mask replacement do not emit model writes', async ({ mount }) => {
  const root = await mount(storyId, { externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await expect(input).toHaveValue('123-456');
  await root.update({ mask: '00/00/00', externalValue: '001234' });
  await expect(input).toHaveValue('00/12/34');
  await root.update({ mask: integerMask, externalValue: '-1234567' });
  await expect(input).toHaveValue('-1\u00a0234\u00a0567');
  await expect(root.getByTestId('updates')).toHaveText('[]');
  await input.fill('42');
  await expect(root.getByTestId('updates')).toHaveText('["42"]');
  await root.update({ mask: '000-000', externalValue: '654321' });
  await input.fill('987654');
  await expect(root.getByTestId('updates')).toHaveText('["42","987654"]');
});

test('editing an incompatible external string reactivates the mask', async ({ mount }) => {
  const root = await mount(storyId, { externalValue: '1234567' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await expect(input).toHaveValue('1234567');
  await expect(root.getByTestId('status')).toHaveText('invalid');
  await expect(root.getByTestId('updates')).toHaveText('[]');
  await input.fill('123456');
  await expect(input).toHaveValue('123-456');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await expect(root.getByTestId('status')).toHaveText('valid');
  await expect(root.getByTestId('updates')).toHaveText('["123456"]');
});

test('integer drafts survive parent echoes, normalization and consecutive undo/redo', async ({ mount }) => {
  const root = await mount(storyId, { mask: integerMask });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await input.pressSequentially('-');
  await expect(input).toHaveValue('-');
  await expect(root.getByTestId('model')).toHaveText('');
  await expect(root.getByTestId('status')).toHaveText('incomplete');
  await input.pressSequentially('0');
  await expect(input).toHaveValue('-0');
  await expect(root.getByTestId('model')).toHaveText('0');
  await input.pressSequentially('01');
  await expect(input).toHaveValue('-001');
  await expect(root.getByTestId('model')).toHaveText('-1');
  await expect(root.getByTestId('updates')).toHaveText('["0","-1"]');

  for (const [display, model, status] of [
    ['-00', '0', 'valid'], ['-0', '0', 'valid'], ['-', '', 'incomplete'], ['', '', 'empty'],
  ]) {
    await input.press('ControlOrMeta+Z');
    await expect(input).toHaveValue(display);
    await expect(root.getByTestId('model')).toHaveText(model);
    await expect(root.getByTestId('status')).toHaveText(status);
  }

  for (const display of ['-', '-0', '-00', '-001']) {
    await input.press('ControlOrMeta+Shift+Z');
    await expect(input).toHaveValue(display);
  }

  await expect(root.getByTestId('model')).toHaveText('-1');
  await input.press('Tab');
  await expect(input).toHaveValue('-001');
});

test('integer preserves 400 digits through history and programmatic replacement', async ({ mount }) => {
  const root = await mount(storyId, { mask: integerMask });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  const digits = '1234567890'.repeat(40);
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  await input.fill(`-${digits}`);
  await expect(input).toHaveValue(`-${grouped}`);
  await expect(root.getByTestId('model')).toHaveText(`-${digits}`);
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('');
  await expect(root.getByTestId('model')).toHaveText('');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue(`-${grouped}`);
  await expect(root.getByTestId('model')).toHaveText(`-${digits}`);
  await root.update({ mask: integerMask, externalValue: digits });
  await expect(input).toHaveValue(grouped);
  await expect(root.getByTestId('updates')).toHaveText(JSON.stringify([`-${digits}`, '', `-${digits}`]));
  await root.update({ mask: integerMask, externalValue: '' });
  await expect(input).toHaveValue('');
  await expect(root.getByTestId('status')).toHaveText('empty');
});

test('integer selection, middle paste and deletion preserve caret and history', async ({ mount, page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const root = await mount(storyId, { mask: integerMask, externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await selectInputRange(input, 1, 2);
  await page.evaluate(() => navigator.clipboard.writeText('90'));
  await input.press('ControlOrMeta+V');
  await expect(input).toHaveValue('1\u00a0903\u00a0456');
  await expect(root.getByTestId('model')).toHaveText('1903456');
  await expect.poll(() => input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(4);
  await input.press('Backspace');
  await expect(root.getByTestId('model')).toHaveText('193456');
  await input.press('ControlOrMeta+Z');
  await expect(root.getByTestId('model')).toHaveText('1903456');
  await input.press('ControlOrMeta+Z');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('model')).toHaveText('1903456');
  await input.press('ControlOrMeta+A');
  await input.pressSequentially('-42');
  await expect(root.getByTestId('model')).toHaveText('-42');
});

test('clear resets even an empty canonical model with a minus draft and preserves focus', async ({ mount }) => {
  const root = await mount(storyId, { mask: integerMask });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await input.fill('-');
  await root.getByRole('button', { name: 'Clear Code', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(root.getByTestId('status')).toHaveText('empty');
  await expect(root.getByTestId('updates')).toHaveText('[]');
  await input.fill('123');
  await root.getByRole('button', { name: 'Clear Code', exact: true }).click();
  await expect(root.getByTestId('updates')).toHaveText('["123",""]');
  await expect(root.getByTestId('model')).toHaveText('');
});

test('locked fields follow external models and cannot replay mask history', async ({ mount }) => {
  const root = await mount(storyId, { mask: integerMask });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await input.fill('-00123');
  await root.update({ mask: integerMask, readonly: true });
  await expect(input).toHaveValue('-00\u00a0123');
  await input.press('ControlOrMeta+Z');
  await input.pressSequentially('9');
  await expect(input).toHaveValue('-00\u00a0123');
  await root.update({ mask: integerMask, readonly: true, externalValue: '12345' });
  await expect(input).toHaveValue('12\u00a0345');
  await root.update({ mask: integerMask, readonly: true, disabled: true, externalValue: '-42' });
  await expect(input).toBeDisabled();
  await expect(input).toHaveValue('-42');
  await root.update({ mask: integerMask, readonly: false, disabled: false });
  await input.fill('6');
  await expect(root.getByTestId('model')).toHaveText('6');
  await expect(root.getByTestId('updates')).toHaveText('["-123","6"]');
});

test('base field props, slots, events and exposed methods work independently', async ({ mount }) => {
  const root = await mount(storyId, { externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await expect(root.locator('.DrControl.DrMaskedInputGallery__main')).toBeVisible();
  await expect(input).toHaveAttribute('placeholder', '000-000');
  await expect(input).toHaveAccessibleDescription(/Decorative separators/);
  const id = await input.getAttribute('id');
  await expect(root.locator(`span[data-for="${id}"]`)).toHaveText('#');
  const plain = root.getByRole('textbox', { name: 'Plain slot', exact: true });
  await plain.fill('plain / text');
  await expect(plain).toHaveValue('plain / text');
  await expect(plain).not.toHaveAttribute('inputmode');
  await root.getByRole('button', { name: 'Focus code at end' }).click();
  await expect(input).toBeFocused();
  await expect.poll(() => input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(7);
  await input.press('ArrowLeft');
  await expect(root.getByTestId('event')).toHaveText('keydown');
  await input.dispatchEvent('wheel', { deltaY: 1 });
  await expect(root.getByTestId('event')).toHaveText('wheel');
  await plain.focus();
  await expect(root.getByTestId('event')).toHaveText('blur');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await expect(root.getByTestId('integer-model')).toHaveText('1234567');
});

for (const externalValue of ['', 'invalid external']) {
  test(`composition waits for committed text with external value = ${externalValue}`, async ({ mount }) => {
    const root = await mount(storyId, { externalValue });
    const input = root.getByRole('textbox', { name: 'Code', exact: true });
    await input.focus();

    await input.evaluate((element: HTMLInputElement) => {
      element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      element.value = 'に';
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'に', isComposing: true, inputType: 'insertCompositionText' }));
    });

    await expect(input).toHaveValue('に');
    await expect(root.getByTestId('updates')).toHaveText('[]');

    await input.evaluate((element: HTMLInputElement) => {
      element.value = '123456';
      element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '123456' }));
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: '123456', inputType: 'insertText' }));
    });

    await expect(input).toHaveValue('123-456');
    await expect(root.getByTestId('updates')).toHaveText('["123456"]');
  });
}
