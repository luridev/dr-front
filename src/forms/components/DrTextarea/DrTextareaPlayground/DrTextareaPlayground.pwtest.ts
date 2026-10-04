import { expect, test } from '~/tests/playwright/fixtures';
import { dispatchPaste } from '~/tests/playwright/lib/dispatchPaste/dispatchPaste';
import type { DrTextareaPlaygroundProps } from '@/forms/components/DrTextarea/DrTextareaPlayground/types.support';

const compositionStoryId = 'forms/components/DrTextarea/DrTextareaPlayground/DrTextareaPlayground';

test('generic textarea rejects oversized paste and emits limitExceeded', async ({ mount }) => {
  const maxLength = 10;
  const props: DrTextareaPlaygroundProps = { maxLength };
  const component = await mount(compositionStoryId, props);

  await component.getByRole('button', { name: 'Очистить поле «Source»' }).click();

  const textarea = component.getByRole('textbox', { name: 'Source' });
  const text = 'ab😀cd';
  const pastedText = '123456';
  const eventCount = component.getByTestId('limit-exceeded-count');

  await textarea.fill(text);
  await expect(textarea).toHaveAttribute('maxlength', String(maxLength));

  await textarea.evaluate((element: HTMLTextAreaElement) => {
    element.setSelectionRange(2, 4);
  });

  expect(await dispatchPaste(textarea, pastedText)).toBe(false);
  await expect(eventCount).toHaveText('0');

  await textarea.evaluate((element: HTMLTextAreaElement) => {
    element.setSelectionRange(element.value.length, element.value.length);
  });

  expect(await dispatchPaste(textarea, pastedText)).toBe(true);
  await expect(textarea).toHaveValue(text);
  await expect(component.getByTestId('model-text')).toHaveText(text);
  await expect(component.getByTestId('exceeded-limit')).toHaveText(String(maxLength));
  await expect(eventCount).toHaveText('1');

  await component.update({ maxLength, readonly: true });
  expect(await dispatchPaste(textarea, pastedText)).toBe(false);
  await expect(eventCount).toHaveText('1');

  await component.update({ maxLength, readonly: true, disabled: true });
  await expect(textarea).toBeDisabled();
  await expect(textarea).toHaveAttribute('readonly', '');

  await component.update({ maxLength: undefined, readonly: false, disabled: false });
  expect(await dispatchPaste(textarea, pastedText)).toBe(false);
  await expect(eventCount).toHaveText('1');
});

test('generic textarea exposes slot contexts and regains focus after clearing empty content', async ({ mount }) => {
  const feedback = 'External feedback';
  const props: DrTextareaPlaygroundProps = { state: 'error', message: feedback };
  const component = await mount(compositionStoryId, props);
  const content = component.getByRole('group', { name: 'Source' });
  const extraAction = component.getByTestId('extra-action');
  const clear = component.getByRole('button', { name: 'Очистить поле «Source»' });

  await expect(content).toHaveAccessibleDescription(feedback);
  await expect(content).toHaveAttribute('aria-invalid', 'true');
  await expect(extraAction).toHaveAttribute('aria-controls', await content.getAttribute('id') ?? '');
  await expect(extraAction).toBeEnabled();

  await component.update({ readonly: true });
  await expect(extraAction).toBeEnabled();
  await expect(clear).toHaveCount(0);

  await component.update({ disabled: true, readonly: true });
  await expect(content).toHaveAttribute('aria-disabled', 'true');
  await expect(extraAction).toBeDisabled();
  await expect(clear).toHaveCount(0);

  await component.update({ disabled: false, readonly: false });
  await clear.click();

  const textarea = component.getByRole('textbox', { name: 'Source' });

  await expect(content).toHaveCount(0);
  await expect(textarea).toHaveValue('');
  await expect(textarea).toBeFocused();
  await expect(extraAction).toHaveAttribute('aria-controls', await textarea.getAttribute('id') ?? '');
});

test('read-only textarea preserves focus, parent updates and reading actions', async ({ mount, page }) => {
  const component = await mount('forms/components/DrTextarea/DrTextareaGallery');
  const textarea = component.getByRole('textbox', { name: 'Read-only', exact: true });
  const preview = component.getByRole('button', { name: 'Show value', exact: true });
  const initialValue = await textarea.inputValue();

  await component.getByRole('button', { name: 'Clear', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(textarea).toBeFocused();
  await expect(textarea).not.toBeEditable();
  await expect(component.getByRole('textbox', { name: 'Note', exact: true })).toBeEditable();
  await expect(component.getByRole('textbox', { name: 'Disabled', exact: true })).toBeDisabled();
  await expect(component.getByRole('button', { name: 'Очистить поле «Read-only»' })).toHaveCount(0);
  await expect(component.getByRole('button', { name: 'Replace value' })).toBeDisabled();

  await page.keyboard.press('End');
  await page.keyboard.type('Changed');
  await page.keyboard.press('Backspace');
  await expect(textarea).toHaveValue(initialValue);

  await preview.click();
  await expect(component.getByText(`Preview: ${initialValue}`, { exact: true })).toBeVisible();

  await component.getByRole('button', { name: 'Update from parent' }).click();
  await expect(textarea).not.toHaveValue(initialValue);
  await expect(textarea).not.toBeEditable();
  await preview.click();
  await expect(component.getByText(`Preview: ${await textarea.inputValue()}`, { exact: true })).toBeVisible();
});
