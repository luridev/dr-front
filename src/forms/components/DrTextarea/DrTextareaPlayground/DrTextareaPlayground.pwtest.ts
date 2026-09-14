import { expect, test } from '~/tests/playwright/fixtures';
import { dispatchPaste } from '~/tests/playwright/lib/dispatchPaste/dispatchPaste';
import type { DrTextareaPlaygroundProps } from '@/forms/components/DrTextarea/DrTextareaPlayground/types.support';

const compositionStoryId = 'forms/components/DrTextarea/DrTextareaPlayground/DrTextareaPlayground';

test('generic textarea отклоняет oversized paste и передаёт limitExceeded наружу', async ({ mount }) => {
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

  await component.update({ maxLength: undefined });
  expect(await dispatchPaste(textarea, pastedText)).toBe(false);
  await expect(eventCount).toHaveText('1');
});

test('generic textarea передаёт content/actions context и фокусируется после clear пустого content mode', async ({ mount }) => {
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

  await component.update({ disabled: true });
  await expect(content).toHaveAttribute('aria-disabled', 'true');
  await expect(extraAction).toBeDisabled();
  await expect(clear).toHaveCount(0);

  await component.update({ disabled: false });
  await clear.click();

  const textarea = component.getByRole('textbox', { name: 'Source' });

  await expect(content).toHaveCount(0);
  await expect(textarea).toHaveValue('');
  await expect(textarea).toBeFocused();
  await expect(extraAction).toHaveAttribute('aria-controls', await textarea.getAttribute('id') ?? '');
});
