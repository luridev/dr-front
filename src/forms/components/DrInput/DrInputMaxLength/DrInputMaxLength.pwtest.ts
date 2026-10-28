import { pasteInput, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';
import { dispatchPaste } from '~/tests/playwright/lib/dispatchPaste/dispatchPaste';

const storyId = 'forms/components/DrInput/DrInputMaxLength/DrInputMaxLength';

test('input limits typing and rejects oversized paste while allowing selection replacement', async ({ mount }) => {
  const component = await mount(storyId, { maxLength: 10 });
  const input = component.getByRole('textbox', { name: 'Limited input' });
  const count = component.getByTestId('limit-exceeded-count');

  await expect(input).toHaveAttribute('maxlength', '10');
  await input.pressSequentially('12345678901');
  await expect(input).toHaveValue('1234567890');
  await expect(component.getByTestId('model-value')).toHaveText('1234567890');
  await expect(count).toHaveText('0');

  await input.fill('ab😀cd');
  await selectInputRange(input, 6);
  await pasteInput(input, '123456');
  await expect(input).toHaveValue('ab😀cd');
  await expect(component.getByTestId('model-value')).toHaveText('ab😀cd');
  await expect(component.getByTestId('exceeded-limit')).toHaveText('10');
  await expect(count).toHaveText('1');

  await selectInputRange(input, 2, 4);
  await pasteInput(input, '123456');
  await expect(input).toHaveValue('ab123456cd');
  await expect(component.getByTestId('model-value')).toHaveText('ab123456cd');
  await expect(count).toHaveText('1');
});

test('input paste limits respect readonly, disabled, absent limits and unavailable selection', async ({ mount }) => {
  const component = await mount(storyId, { maxLength: 0 });
  const input = component.getByRole('textbox', { name: 'Limited input' });
  const count = component.getByTestId('limit-exceeded-count');

  expect(await dispatchPaste(input, 'text')).toBe(true);
  await expect(component.getByTestId('exceeded-limit')).toHaveText('0');
  await expect(count).toHaveText('1');

  await component.update({ maxLength: 0, readonly: true });
  expect(await dispatchPaste(input, 'text')).toBe(false);
  await component.update({ maxLength: 0, disabled: true });
  expect(await dispatchPaste(input, 'text')).toBe(false);
  await component.update({});
  await expect(input).not.toHaveAttribute('maxlength');
  expect(await dispatchPaste(input, 'text')).toBe(false);

  await component.update({ maxLength: 10, type: 'email' });
  await input.fill('a@b.test');
  expect(await dispatchPaste(input, 'x@y.test')).toBe(false);
  await expect(count).toHaveText('1');
});

test('input ignores invalid limits for both typing and paste', async ({ mount }) => {
  const component = await mount(storyId, { maxLength: 0 });
  const input = component.getByRole('textbox', { name: 'Limited input' });

  await input.pressSequentially('a');
  await expect(input).toHaveValue('');

  for (const maxLength of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    await component.update({ maxLength });
    await expect(input).not.toHaveAttribute('maxlength');
    await input.fill('');
    await input.pressSequentially('abc');
    await pasteInput(input, 'de');
    await expect(input).toHaveValue('abcde');
    await expect(component.getByTestId('model-value')).toHaveText('abcde');
  }

  await expect(component.getByTestId('limit-exceeded-count')).toHaveText('0');
});

test('input length limits do not truncate parent values', async ({ mount }) => {
  const component = await mount(storyId, { maxLength: 2 });
  const input = component.getByRole('textbox', { name: 'Limited input' });

  await component.getByRole('button', { name: 'Replace from parent' }).click();
  await expect(input).toHaveValue('Longer parent value');
  await expect(component.getByTestId('model-value')).toHaveText('Longer parent value');
  await expect(component.getByTestId('limit-exceeded-count')).toHaveText('0');
});
