import { maskingStoryId as storyId } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput, pasteInput, replaceInput, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

test('date supports signed extended years, Temporal boundaries and external year padding', async ({ mount }) => {
  const root = await mount(storyId);
  const input = getInput(root, 'date');

  for (const [text, model] of [
    ['01010000', '0000-01-01'], ['01010001', '0001-01-01'], ['0102-100000', '-100000-02-01'],
    ['1904-271821', '-271821-04-19'], ['1309275760', '+275760-09-13'],
  ]) {
    await replaceInput(input, text);
    await expect(root.getByTestId('date-model')).toHaveText(model);
    await input.press('Enter');
    await input.press('Tab');
    await expect(root.getByTestId('date-model')).toHaveText(model);
  }

  for (const [model, text] of [['0000-01-01', '01.01.0000'], ['0010-02-01', '01.02.0010'], ['-000001-02-01', '01.02.-0001']]) {
    await root.update({ externalDate: model });
    await expect(input).toHaveValue(text);
  }

  await input.fill('');
  await pasteInput(input, '01.02.-100000');
  await expect(root.getByTestId('date-model')).toHaveText('-100000-02-01');

  for (const [text, status] of [['31022026', 'invalid'], ['1409275760', 'out-of-range'], ['0101-', 'incomplete']]) {
    await replaceInput(input, text);
    await expect(root.getByTestId('date-model')).toHaveText('null');
    await expect(root.getByTestId('date-status')).toHaveText(status);
  }
});

test('date repairs middle segments and preserves the year through undo and redo', async ({ mount }) => {
  const root = await mount(storyId);
  const input = getInput(root, 'date');
  await replaceInput(input, '0102100000');
  await selectInputRange(input, 3, 5);
  await input.pressSequentially('03');
  await expect(root.getByTestId('date-model')).toHaveText('+100000-03-01');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue(/\.100000$/);
  await input.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('date-model')).toHaveText('+100000-03-01');
  await selectInputRange(input, 3, 5);
  await input.press('Delete');
  await expect(input).toHaveValue(/\.100000$/);
  await expect(root.getByTestId('date-model')).toHaveText('null');
  await selectInputRange(input, 3, 5);
  await input.pressSequentially('04');
  await expect(root.getByTestId('date-model')).toHaveText('+100000-04-01');
  await selectInputRange(input, 6);
  await input.press('-');
  await expect(root.getByTestId('date-model')).toHaveText('-100000-04-01');
  await selectInputRange(input, 6, 7);
  await input.press('Delete');
  await expect(root.getByTestId('date-model')).toHaveText('+100000-04-01');
});
