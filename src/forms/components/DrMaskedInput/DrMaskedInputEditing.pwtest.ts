import { selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { maskedInputStoryId as storyId } from '@/forms/components/DrMaskedInput/config.support';
import { expect, test } from '~/tests/playwright/fixtures';

test('native overwrite replaces a middle character and keeps the caret', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'overwrite', externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await selectInputRange(input, 1, 1);
  await input.pressSequentially('9');
  await expect(input).toHaveValue('193-456');
  await expect(root.getByTestId('model')).toHaveText('193456');
  await expect.poll(() => input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(2);
});

test('external updates keep ordinary Pattern undo history with the same config', async ({ mount }) => {
  const root = await mount(storyId, { externalValue: '123456' });
  const input = root.getByRole('textbox', { name: 'Code', exact: true });
  await input.fill('654321');
  await expect(input).toBeFocused();
  await root.update({ externalValue: '987654' });
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('987-654');
  await expect(root.getByTestId('updates')).toHaveText('["654321"]');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('654-321');
  await expect(root.getByTestId('model')).toHaveText('654321');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue('987-654');
  await expect(root.getByTestId('model')).toHaveText('987654');
});
