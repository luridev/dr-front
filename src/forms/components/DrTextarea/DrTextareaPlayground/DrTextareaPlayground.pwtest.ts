import { expect, test } from '~/tests/playwright/fixtures';
import { dispatchPaste } from '~/tests/playwright/lib/dispatchPaste/dispatchPaste';
import type { DrTextareaPlaygroundProps } from '@/forms/components/DrTextarea/DrTextareaPlayground/types.support';

const compositionStoryId = 'forms/components/DrTextarea/DrTextareaPlayground/DrTextareaPlayground';

test('a native textarea retains its name and feedback with kind group', async ({ mount }) => {
  const component = await mount(compositionStoryId, { mode: 'textarea', kind: 'group', state: 'error', message: 'Check this value' });
  const textarea = component.getByRole('textbox');

  await expect(textarea).toHaveAccessibleName('Source');
  await expect(textarea).toHaveAccessibleDescription('Check this value');
  await expect(textarea).toHaveAttribute('aria-invalid', 'true');
  await component.update({ mode: 'textarea', kind: 'group' });
  await expect(textarea).not.toHaveAttribute('aria-invalid');
  await expect(textarea).toHaveAccessibleDescription('');
});

test('textarea forwards typing hints and focus from its native editor', async ({ mount }) => {
  const props: DrTextareaPlaygroundProps = {
    inputMode: 'url',
    enterKeyHint: 'done',
    spellCheck: false,
    autoCapitalize: 'off',
    autoCorrect: 'off',
  };

  const component = await mount(compositionStoryId, props);

  await component.getByRole('button', { name: 'Clear Source' }).click();

  const textarea = component.getByRole('textbox', { name: 'Source' });
  const focusCount = component.getByTestId('focus-count');

  await expect(textarea).toHaveAttribute('inputmode', 'url');
  await expect(textarea).toHaveAttribute('enterkeyhint', 'done');
  await expect(textarea).toHaveAttribute('spellcheck', 'false');
  await expect(textarea).toHaveAttribute('autocapitalize', 'off');
  await expect(textarea).toHaveAttribute('autocorrect', 'off');
  await expect(focusCount).toHaveText('1');
  await expect(component.getByTestId('native-focus-target')).toHaveText('true');
  await component.getByTestId('extra-action').focus();
  await expect(focusCount).toHaveText('1');
  await textarea.focus();
  await expect(focusCount).toHaveText('2');

  await component.update({});
  await expect(textarea).not.toHaveAttribute('spellcheck');
});

test('textarea counter respects the display threshold, content mode and optional limit', async ({ mount }) => {
  const component = await mount(compositionStoryId, { maxLength: 0 });

  await expect(component.getByText('0 / 0', { exact: true })).toHaveCount(0);
  await component.update({ maxLength: 2000 });
  await component.getByRole('button', { name: 'Clear Source' }).click();

  const textarea = component.getByRole('textbox', { name: 'Source' });

  await textarea.fill('x'.repeat(1399));
  await expect(component.getByText('1,399 / 2,000', { exact: true })).toHaveCount(0);
  await textarea.fill('x'.repeat(1400));
  await expect(component.getByText('1,400 / 2,000', { exact: true })).toBeVisible();
  await textarea.fill('x'.repeat(2000));
  await expect(component.getByText('2,000 / 2,000', { exact: true })).toBeVisible();

  await component.update({ maxLength: undefined });
  await expect(component.getByText('2,000 / 2,000', { exact: true })).toHaveCount(0);
  await expect(textarea).toHaveValue('x'.repeat(2000));
  await expect(textarea).not.toHaveAttribute('maxlength');
});

test('generic textarea rejects oversized paste and emits limitExceeded', async ({ mount }) => {
  const maxLength = 10;
  const props: DrTextareaPlaygroundProps = { maxLength };
  const component = await mount(compositionStoryId, props);

  await component.getByRole('button', { name: 'Clear Source' }).click();

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

  await component.update({ maxLength, disabled: true });
  await expect(textarea).toBeDisabled();
  expect(await dispatchPaste(textarea, pastedText)).toBe(false);
  await expect(eventCount).toHaveText('1');

  await component.update({ maxLength: undefined, readonly: false, disabled: false });
  expect(await dispatchPaste(textarea, pastedText)).toBe(false);
  await expect(eventCount).toHaveText('1');
});

test('invalid textarea limits leave native editing, paste and the counter unlimited', async ({ mount }) => {
  const component = await mount(compositionStoryId, { maxLength: 10 });
  await component.getByRole('button', { name: 'Clear Source' }).click();

  const textarea = component.getByRole('textbox', { name: 'Source' });
  await textarea.fill('1234567890');

  for (const maxLength of [-1, 1.5]) {
    await component.update({ maxLength });
    await expect(textarea).not.toHaveAttribute('maxlength');
    await expect(component.locator('.DrTextareaPanel__counter')).toHaveCount(0);
    expect(await dispatchPaste(textarea, 'extra text')).toBe(false);
    await textarea.press('End');
    await textarea.pressSequentially(' extra');
    await expect(textarea).toHaveValue(maxLength === -1 ? '1234567890 extra' : '1234567890 extra extra');
    await expect(component.getByTestId('model-text')).toHaveText(await textarea.inputValue());
  }

  await expect(component.getByTestId('limit-exceeded-count')).toHaveText('0');
  await expect(component.getByTestId('model-text')).toHaveText('1234567890 extra extra');
});

test('generic textarea exposes slot contexts and regains focus after clearing empty content', async ({ mount }) => {
  const feedback = 'External feedback';
  const props: DrTextareaPlaygroundProps = { state: 'error', message: feedback };
  const component = await mount(compositionStoryId, props);
  const content = component.getByRole('group', { name: 'Source' });
  const extraAction = component.getByTestId('extra-action');
  const clear = component.getByRole('button', { name: 'Clear Source' });

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
  await expect(textarea).not.toHaveAttribute('spellcheck');
  await expect(component.getByRole('textbox', { name: 'Note', exact: true })).toBeEditable();
  await expect(component.getByRole('textbox', { name: 'Disabled', exact: true })).toBeDisabled();
  await expect(component.getByRole('button', { name: 'Clear Read-only' })).toHaveCount(0);
  await expect(component.getByRole('button', { name: 'Replace value' })).toBeDisabled();

  await textarea.selectText();
  await textarea.press('Delete');
  await expect(textarea).toHaveValue(initialValue);

  await preview.click();
  await expect(component.getByText(`Preview: ${initialValue}`, { exact: true })).toBeVisible();

  await component.getByRole('button', { name: 'Update from parent' }).click();
  await expect(textarea).not.toHaveValue(initialValue);
  await expect(textarea).not.toBeEditable();
  await preview.click();
  await expect(component.getByText(`Preview: ${await textarea.inputValue()}`, { exact: true })).toBeVisible();
});
