import { maskingStoryId as storyId, maskingStoryInitialTime } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput, pasteInput, readSelection, replaceInput, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

test('time preserves its full model and focus through precision changes, edits and external updates', async ({ mount }) => {
  const component = await mount(storyId);
  const time = getInput(component, 'time');
  const nativeInput = await time.elementHandle();

  expect(nativeInput).not.toBeNull();
  await time.focus();
  await expect(time).toHaveValue('12:34');

  const precisions = [
    { smallestUnit: 'nanosecond', value: maskingStoryInitialTime },
    { smallestUnit: 'microsecond', value: '12:34:56.123456' },
    { smallestUnit: 'millisecond', value: '12:34:56.123' },
    { smallestUnit: 'second', value: '12:34:56' },
    { smallestUnit: 'minute', value: '12:34' },
  ] as const;

  for (const { smallestUnit, value } of precisions) {
    await component.update({ smallestUnit });
    await expect(time).toHaveValue(value);
    await expect(time).toBeFocused();
    expect(await nativeInput.evaluate((element) => element.isConnected)).toBe(true);
    await expect(component.getByTestId('time-model')).toHaveText(maskingStoryInitialTime);
    await expect(component.getByTestId('time-model-identity')).toHaveText('true');

    await time.press('End');
    await time.pressSequentially('9');
    await expect(time).toHaveValue(value);
    await expect.poll(() => readSelection(time)).toEqual([value.length, value.length]);
    await expect(component.getByTestId('time-model-identity')).toHaveText('true');
  }

  await time.press('Enter');
  await time.press('Tab');
  await expect(component.getByTestId('time-model')).toHaveText(maskingStoryInitialTime);
  await selectInputRange(time, 3, 5);
  await time.press('Delete');
  await expect(component.getByTestId('time-model')).toHaveText('null');
  await selectInputRange(time, 3, 5);
  await time.pressSequentially('45');
  await expect(component.getByTestId('time-model')).toHaveText('12:45:56.123456789');
  await component.update({ externalTime: '01:02:03.004005006' });
  await expect(time).toHaveValue('01:02');
  await component.update({ smallestUnit: 'nanosecond' });
  await expect(time).toHaveValue('01:02:03.004005006');
  await component.update({ externalTime: null });
  await expect(time).toHaveValue('');
  await component.update({ smallestUnit: 'minute' });
  await time.pressSequentially('1122');
  await expect(component.getByTestId('time-model')).toHaveText('11:22:00');
});

test('time preserves mid-value editing, selection, Delete/Backspace and the paste lifecycle', async ({ mount }) => {
  const component = await mount(storyId, { smallestUnit: 'second' });
  const time = getInput(component, 'time');

  await selectInputRange(time, 3);
  await time.pressSequentially('5');
  await expect(time).toHaveValue('12:54:56');
  await expect.poll(() => readSelection(time)).toEqual([4, 4]);

  await selectInputRange(time, 3, 5);
  await time.pressSequentially('45');
  await expect(time).toHaveValue('12:45:56');
  await expect.poll(() => readSelection(time)).toEqual([5, 5]);

  await selectInputRange(time, 5);
  await time.press('Backspace');
  await expect(time).toHaveValue('12:4_:56');
  await expect.poll(() => readSelection(time)).toEqual([4, 4]);
  await selectInputRange(time, 3);
  await time.press('Delete');
  await expect(time).toHaveValue('12:__:56');
  await expect.poll(() => readSelection(time)).toEqual([3, 3]);

  await selectInputRange(time, 0, 8);

  await pasteInput(time, '235958');

  await expect(time).toHaveValue('23:59:58');
  await expect.poll(() => readSelection(time)).toEqual([8, 8]);
  await expect(component.getByTestId('time-model')).toHaveText('23:59:58.123456789');
  await expect(time).toBeFocused();
});

test('conditional remount uses the current precision instead of the stale mask', async ({ mount }) => {
  const component = await mount(storyId);
  const time = getInput(component, 'time');
  const nativeInput = await time.elementHandle();

  expect(nativeInput).not.toBeNull();
  await component.update({ showTime: false, smallestUnit: 'nanosecond' });
  await expect(time).toHaveCount(0);
  expect(await nativeInput.evaluate((element) => element.isConnected)).toBe(false);

  await component.update({ showTime: true, smallestUnit: 'nanosecond' });
  await expect(time).toHaveValue(maskingStoryInitialTime);
  await time.fill('235958123456789');
  await expect(time).toHaveValue('23:59:58.123456789');
});

test('time accepts all supported precisions and preserves adjacent fields through undo and redo', async ({ mount }) => {
  const root = await mount(storyId);
  const input = getInput(root, 'time');

  for (const [smallestUnit, text, model] of [
    ['minute', '2359', '23:59:00'], ['second', '235958', '23:59:58'],
    ['millisecond', '235958001', '23:59:58.001'], ['microsecond', '235958000001', '23:59:58.000001'],
    ['nanosecond', '235958123456789', '23:59:58.123456789'],
  ]) {
    await root.update({ smallestUnit });
    await replaceInput(input, text);
    await expect(root.getByTestId('time-model')).toHaveText(model);
  }

  await selectInputRange(input, 3, 5);
  await input.pressSequentially('45');
  await expect(root.getByTestId('time-model')).toHaveText('23:45:58.123456789');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue(/^23:.*:58\.123456789$/);
  await input.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('time-model')).toHaveText('23:45:58.123456789');

  await replaceInput(input, '11:11:5');
  await expect(root.getByTestId('time-status')).toHaveText('incomplete');
  await expect(root.getByTestId('time-model')).toHaveText('null');
  await input.press('6');
  await expect(root.getByTestId('time-model')).toHaveText('11:11:56');
  await root.locator('.DrInputMasking__time .DrInput__clearButton').click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
  await expect(root.getByTestId('time-status')).toHaveText('empty');
});
