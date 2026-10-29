import { selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { maskedInputStoryId as storyId } from '@/forms/components/DrMaskedInput/config.support';
import { expect, test } from '~/tests/playwright/fixtures';

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
  await expect(root.getByTestId('digits-model')).toHaveText('1234567');
});

for (const externalValue of ['', 'invalid external']) {
  test(`composition waits for committed text with external value = ${externalValue}`, async ({ mount }) => {
    const root = await mount(storyId, { externalValue });
    const input = root.getByRole('textbox', { name: 'Code', exact: true });
    const initialUpdates = externalValue === '' ? [] : [''];
    await expect(root.getByTestId('updates')).toHaveText(JSON.stringify(initialUpdates));
    await input.focus();

    await input.evaluate((element: HTMLInputElement) => {
      element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      element.value = 'に';
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'に', isComposing: true, inputType: 'insertCompositionText' }));
    });

    await expect(input).toHaveValue('に');
    await expect(root.getByTestId('updates')).toHaveText(JSON.stringify(initialUpdates));

    await input.evaluate((element: HTMLInputElement) => {
      element.value = '123456';
      element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '123456' }));
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: '123456', inputType: 'insertText' }));
    });

    await expect(input).toHaveValue('123-456');
    await expect(root.getByTestId('updates')).toHaveText(JSON.stringify([...initialUpdates, '123456']));
  });
}

test('multiple native mask instances edit independently', async ({ mount }) => {
  const root = await mount(storyId);
  const code = root.getByRole('textbox', { name: 'Code', exact: true });
  const serial = root.getByRole('textbox', { name: 'Serial', exact: true });
  const digits = root.getByRole('textbox', { name: 'Digits', exact: true });
  await code.fill('123456');
  await serial.fill('CD5678');
  await digits.fill('0'.repeat(400));
  await expect(code).toHaveValue('123-456');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await expect(serial).toHaveValue('CD-5678');
  await expect(root.getByTestId('serial-model')).toHaveText('CD5678');
  await expect(digits).toHaveValue('0'.repeat(400));
  await expect(root.getByTestId('digits-model')).toHaveText('0'.repeat(400));
});

test('external changes and config replacement preserve models without emitting writes', async ({ mount }) => {
  const root = await mount(storyId, { externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await expect(input).toHaveValue('123-456');
  await root.update({ mask: '00/00/00', externalValue: '001234' });
  await expect(input).toHaveValue('00/12/34');
  await root.update({ variant: 'digits', externalValue: '001234567' });
  await expect(input).toHaveValue('001234567');
  await expect(root.getByTestId('updates')).toHaveText('[]');
  await input.fill('42');
  await root.update({ mask: '000-000', externalValue: '654321' });
  await input.fill('987654');
  await expect(root.getByTestId('updates')).toHaveText('["42","987654"]');
});

test('external strings follow native filtering and publish the accepted model', async ({ mount }) => {
  const root = await mount(storyId, { externalValue: '1234567' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await expect(input).toHaveValue('123-456');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await expect(root.getByTestId('status')).toHaveText('valid');
  await expect(root.getByTestId('updates')).toHaveText('["123456"]');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await root.update({ externalValue: '12a3' });
  await expect(input).toHaveValue('123');
  await expect(root.getByTestId('model')).toHaveText('123');
  await expect(root.getByTestId('status')).toHaveText('incomplete');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await root.update({ externalValue: 'bad' });
  await expect(input).toHaveValue('');
  await expect(root.getByTestId('model')).toHaveText('');
  await expect(root.getByTestId('status')).toHaveText('empty');
  await expect(root.getByTestId('updates')).toHaveText('["123456","123",""]');
  await input.fill('987654');
  await expect(root.getByTestId('model')).toHaveText('987654');
});

test('ordinary Pattern keeps selection, middle edits, paste and undo/redo', async ({ mount, page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const root = await mount(storyId);
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await input.pressSequentially('123456');
  await selectInputRange(input, 1, 3);
  await page.evaluate(() => navigator.clipboard.writeText('90'));
  await input.press('ControlOrMeta+V');
  await expect(input).toHaveValue('190-456');
  await expect(root.getByTestId('model')).toHaveText('190456');
  await expect.poll(() => input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(3);
  await input.press('Backspace');
  await expect(root.getByTestId('model')).toHaveText('19456');
  await input.press('ControlOrMeta+Z');
  await expect(root.getByTestId('model')).toHaveText('190456');
  await input.press('ControlOrMeta+Z');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('model')).toHaveText('190456');
  await root.getByRole('button', { name: 'Clear Code', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(root.getByTestId('status')).toHaveText('empty');
});

test('readonly and disabled block history and editing but accept external values', async ({ mount }) => {
  const root = await mount(storyId);
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await input.fill('123456');
  await root.update({ readonly: true });
  await input.press('ControlOrMeta+Z');
  await input.pressSequentially('9');
  await expect(input).toHaveValue('123-456');
  await root.update({ readonly: true, externalValue: '654321' });
  await expect(input).toHaveValue('654-321');
  await root.update({ disabled: true, externalValue: '123' });
  await expect(input).toBeDisabled();
  await expect(input).toHaveValue('123');
  await root.update({ disabled: false });
  await input.fill('987654');
  await expect(root.getByTestId('model')).toHaveText('987654');
  await expect(root.getByTestId('updates')).toHaveText('["123456","987654"]');
});

for (const [variant, entered, display, model] of [
  ['prepared', 'ab', 'bc', 'bc'],
  ['hidden', '123456', '###-###', '123456'],
  ['exposed', '1234', '12:34', '34'],
  ['repeat', '123456789', '123456789', '123456789'],
  ['function', '123', '123', '123'],
  ['number', '12,5', '12,5', '12.5'],
  ['date', '01022024', '01.02.2024', '01.02.2024'],
] as const) {
  test(`${variant} uses live native state across parent echoes and rerenders`, async ({ mount }) => {
    const root = await mount(storyId, { variant });
    const input = root.getByRole('textbox', { name: 'Code', exact: true });
    await input.fill(entered);
    await expect(input).toHaveValue(display);
    await expect(root.getByTestId('model')).toHaveText(model);
    await root.getByRole('button', { name: 'Rerender 0', exact: true }).click();
    await expect(input).toHaveValue(display);
    await expect(root.getByTestId('model')).toHaveText(model);
    await expect(input).toHaveAttribute('inputmode', 'text');
    await root.getByRole('button', { name: 'Clear Code', exact: true }).click();
    await expect(input).toHaveValue('');
    await expect(root.getByTestId('model')).toHaveText('');
    await expect(root.getByTestId('status')).toHaveText('empty');
  });
}

test('placeholders remain empty and Dynamic chooses a matching branch', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'placeholders' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await expect(input).toHaveValue('+7 (___)');
  await expect(root.getByTestId('model')).toHaveText('7');
  await expect(root.getByTestId('status')).toHaveText('empty');
  await input.fill('7123');
  await expect(root.getByTestId('status')).toHaveText('valid');
  await root.getByRole('button', { name: 'Clear Code', exact: true }).click();
  await expect(root.getByTestId('status')).toHaveText('empty');
  await root.update({ variant: 'dynamic' });
  await input.fill('1234');
  await expect(input).toHaveValue('12-34');
  await input.fill('AB123');
  await expect(input).toHaveValue('AB-123');
  await expect(root.getByTestId('model')).toHaveText('AB123');
});

for (const [variant, externalValue, display, model] of [
  ['boundedNumber', '1', '5', '5'],
  ['number', '001.20', '1,2', '1.2'],
  ['prepared', 'ab', 'bc', 'bc'],
  ['hidden', '1234567', '###-###', '123456'],
  ['emptyPlaceholders', '', '___-___', ''],
  ['exposed', '123', '12', '12'],
  ['dynamic', 'AB1234', 'AB-123', 'AB123'],
] as const) {
  test(`${variant} synchronizes initial normalization and parent echoes`, async ({ mount }) => {
    const root = await mount(storyId, { variant, externalValue });
    const input = root.getByRole('textbox', { name: 'Code', exact: true });
    await expect(input).toHaveValue(display);
    await expect(root.getByTestId('model')).toHaveText(model);
    const writes = externalValue === model ? [] : [model];
    await expect(root.getByTestId('updates')).toHaveText(JSON.stringify(writes));
    await root.getByRole('button', { name: 'Rerender 0', exact: true }).click();
    await expect(input).toHaveValue(display);
    await expect(root.getByTestId('updates')).toHaveText(JSON.stringify(writes));
  });
}

test('external normalization and configuration replacement settle without extra writes', async ({ mount }) => {
  const root = await mount(storyId, { externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await root.update({ mask: '00-00' });
  await expect(input).toHaveValue('12-34');
  await expect(root.getByTestId('model')).toHaveText('1234');
  await expect(root.getByTestId('updates')).toHaveText('["1234"]');
  await root.update({ variant: 'boundedNumber', externalValue: '1' });
  await expect(input).toHaveValue('5');
  await expect(root.getByTestId('model')).toHaveText('5');
  await root.update({ variant: 'boundedNumber', externalValue: '2' });
  await expect(input).toHaveValue('5');
  await expect(root.getByTestId('model')).toHaveText('5');
  await expect(root.getByTestId('updates')).toHaveText('["1234","5","5"]');
  await root.update({ variant: 'boundedNumber', externalValue: '5' });
  await expect(root.getByTestId('updates')).toHaveText('["1234","5","5"]');
  await root.update({ variant: 'number', externalValue: '001.20' });
  await expect(input).toHaveValue('1,2');
  await expect(root.getByTestId('model')).toHaveText('1.2');
});

test('external writes update hidden values and preserve native expose context', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'hidden', externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await root.update({ variant: 'hidden', externalValue: '9876543' });
  await expect(input).toHaveValue('###-###');
  await expect(root.getByTestId('model')).toHaveText('987654');
  await input.press('ControlOrMeta+Z');
  await expect(root.getByTestId('model')).toHaveText('123456');
  await root.update({ variant: 'exposed', externalValue: '' });
  await input.fill('1234');
  await root.update({ variant: 'exposed', externalValue: '567' });
  await expect(input).toHaveValue('12:56');
  await expect(root.getByTestId('model')).toHaveText('56');
});

test('clear updates native history even when displayChar equals the placeholder', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'concealedPlaceholder', externalValue: '1' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await expect(input).toHaveValue('_');
  await root.getByRole('button', { name: 'Clear Code', exact: true }).click();
  await expect(input).toHaveValue('_');
  await expect(root.getByTestId('model')).toHaveText('');
  await expect(root.getByTestId('status')).toHaveText('empty');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('_');
  await expect(root.getByTestId('model')).toHaveText('1');
  await expect(root.getByTestId('status')).toHaveText('valid');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('model')).toHaveText('');
});
