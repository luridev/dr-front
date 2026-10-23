import { maskingStoryId as storyId, maskingStoryInitialTime } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput, pasteInput, readSelection, replaceInput, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

const timeStoryId = 'forms/components/DrInputTime/DrInputTimeGallery';

test('native clipboard paste integrates Date and Time masks with history and hidden precision', async ({ mount, page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const root = await mount(storyId);
  const date = getInput(root, 'date');
  const time = getInput(root, 'time');

  await date.fill('');
  await page.evaluate(() => navigator.clipboard.writeText('12/31/2026'));
  await date.press('ControlOrMeta+V');
  await expect(date).toHaveValue('12/31/2026');
  await expect(root.getByTestId('date-model')).toHaveText('2026-12-31');
  await date.press('ControlOrMeta+Z');
  await expect(root.getByTestId('date-model')).toHaveText('null');
  await date.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('date-model')).toHaveText('2026-12-31');
  await selectInputRange(time, 0, 5);
  await page.evaluate(() => navigator.clipboard.writeText('11:59'));
  await time.press('ControlOrMeta+V');
  await expect(time).toHaveValue('11:59');
  await expect(root.getByTestId('time-model')).toHaveText('23:59:56.123456789');
  await time.press('ControlOrMeta+Z');
  await expect(root.getByTestId('time-model')).toHaveText(maskingStoryInitialTime);
  await time.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('time-model')).toHaveText('23:59:56.123456789');
});

test('time preserves its full model and focus through precision changes, edits and external updates', async ({ mount }) => {
  const component = await mount(storyId);
  const time = getInput(component, 'time');
  const nativeInput = await time.elementHandle();
  const periodButton = component.locator('.DrInputMasking__time .DrInputTime__periodButton');

  expect(nativeInput).not.toBeNull();
  await expect(periodButton).toHaveText('PM');
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
  await expect(periodButton).toHaveText('AM');
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

  await pasteInput(time, '115958');

  await expect(time).toHaveValue('11:59:58');
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
  await time.fill('115958123456789');
  await expect(time).toHaveValue('11:59:58.123456789');
  await expect(component.getByTestId('time-model')).toHaveText('23:59:58.123456789');
});

test('time accepts all supported precisions and preserves adjacent fields through undo and redo', async ({ mount }) => {
  const root = await mount(storyId);
  const input = getInput(root, 'time');
  const periodButton = root.locator('.DrInputMasking__time .DrInputTime__periodButton');

  for (const [smallestUnit, text, model] of [
    ['minute', '1159', '23:59:00'], ['second', '115958', '23:59:58'],
    ['millisecond', '115958001', '23:59:58.001'], ['microsecond', '115958000001', '23:59:58.000001'],
    ['nanosecond', '115958123456789', '23:59:58.123456789'],
  ]) {
    await root.update({ smallestUnit });
    await input.fill('');

    if (await periodButton.innerText() === 'AM') {
      await periodButton.click();
    }

    await input.pressSequentially(text);
    await expect(root.getByTestId('time-model')).toHaveText(model);
  }

  await selectInputRange(input, 3, 5);
  await input.pressSequentially('45');
  await expect(root.getByTestId('time-model')).toHaveText('23:45:58.123456789');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue(/^11:.*:58\.123456789$/);
  await input.press('ControlOrMeta+Shift+Z');
  await expect(root.getByTestId('time-model')).toHaveText('23:45:58.123456789');

  await replaceInput(input, '11:11:5');

  if (await periodButton.innerText() === 'PM') {
    await periodButton.click();
  }

  await expect(root.getByTestId('time-status')).toHaveText('incomplete');
  await expect(root.getByTestId('time-model')).toHaveText('null');
  await input.press('6');
  await expect(root.getByTestId('time-model')).toHaveText('11:11:56');
  await root.locator('.DrInputMasking__time .DrInput__clearButton').click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
  await expect(root.getByTestId('time-status')).toHaveText('empty');
});

test('period control preserves hidden precision, keyboard focus and form safety', async ({ mount, page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const root = await mount(timeStoryId);
  const input = root.getByRole('textbox', { name: 'Minutes', exact: true });
  const model = root.getByTestId('time-gallery-model');
  const periodButton = root.locator('.DrInputTime__periodButton').first();

  await expect(input).toHaveValue('11:45');
  await expect(periodButton).toHaveText('PM');
  await expect(periodButton).toHaveAttribute('type', 'button');
  await expect(periodButton).toHaveAccessibleName('Switch Minutes to AM');
  const inputBounds = await input.boundingBox();
  const buttonBounds = await periodButton.boundingBox();

  expect(inputBounds).not.toBeNull();
  expect(buttonBounds).not.toBeNull();

  if (inputBounds !== null && buttonBounds !== null) {
    expect(inputBounds.x + inputBounds.width).toBeLessThanOrEqual(buttonBounds.x);
    expect(buttonBounds.x + buttonBounds.width).toBeLessThanOrEqual(360);
  }

  const screenshotPath = testInfo.outputPath('time-360.png');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach('Time controls at 360px', { path: screenshotPath, contentType: 'image/png' });
  await selectInputRange(input, 3, 5);
  await periodButton.click();
  await expect(input).toBeFocused();
  expect(await readSelection(input)).toEqual([3, 5]);
  await expect(periodButton).toHaveText('AM');
  await expect(model).toHaveText('11:45:56.123456789');
  await periodButton.click();
  await expect(model).toHaveText('23:45:56.123456789');
  await input.press('Tab');
  await expect(root.getByRole('button', { name: 'Clear time', exact: true })).toBeFocused();
  await input.page().keyboard.press('Tab');
  await expect(periodButton).toBeFocused();
  await periodButton.press('Enter');
  await expect(periodButton).toBeFocused();
  await expect(model).toHaveText('11:45:56.123456789');
  await periodButton.press('Space');
  await expect(periodButton).toBeFocused();
  await expect(model).toHaveText('23:45:56.123456789');
  await expect(root.getByRole('button', { name: 'Switch Read-only time to AM', exact: true })).toBeDisabled();
  await expect(root.getByRole('button', { name: 'Switch Disabled to AM', exact: true })).toBeDisabled();

  for (const [text, am, pm] of [
    ['1200', '00:00:56.123456789', '12:00:56.123456789'],
    ['1159', '11:59:56.123456789', '23:59:56.123456789'],
  ]) {
    await input.fill(text);
    await expect(model).toHaveText(pm);
    await periodButton.click();
    await expect(model).toHaveText(am);
    await periodButton.click();
    await expect(model).toHaveText(pm);
  }

  await expect(root.getByTestId('time-gallery-form')).toHaveAttribute('data-submissions', '0');
});

test('period changes leave drafts incomplete and editing, paste and history remain usable', async ({ mount }) => {
  const root = await mount(timeStoryId);
  const input = root.getByRole('textbox', { name: 'Minutes', exact: true });
  const model = root.getByTestId('time-gallery-model');
  const periodButton = root.locator('.DrInputTime__periodButton').first();

  await input.fill('11:1');
  await expect(model).toHaveText('null');
  await expect(model).toHaveAttribute('data-status', 'incomplete');
  await periodButton.click();
  await expect(input).toHaveValue('11:1');
  await expect(model).toHaveText('null');
  await input.press('1');
  await expect(model).toHaveText('11:11:56.123456789');
  await selectInputRange(input, 3, 5);
  await pasteInput(input, '45');
  await expect(model).toHaveText('11:45:56.123456789');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('11:11');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(model).toHaveText('11:45:56.123456789');
  await root.getByRole('button', { name: 'Clear time', exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
  await periodButton.click();
  await expect(input).toHaveValue('');
  await expect(model).toHaveText('null');
  await input.pressSequentially('0111');
  await expect(model).toHaveText('13:11:00');

  const seconds = root.getByRole('textbox', { name: 'Seconds', exact: true });
  const secondsModel = root.getByTestId('time-gallery-seconds-model');

  await seconds.fill('11:11:5');
  await root.getByRole('button', { name: 'Switch Seconds to AM', exact: true }).click();
  await expect(seconds).toHaveValue('11:11:5');
  await expect(secondsModel).toHaveText('null');
  await seconds.press('6');
  await expect(secondsModel).toHaveText('11:11:56');
});

test('time switches locales without model updates and retains history for equivalent hour cycles', async ({ mount }) => {
  const root = await mount(timeStoryId);
  const input = root.getByRole('textbox', { name: 'Minutes', exact: true });
  const model = root.getByTestId('time-gallery-model');
  const localeSelect = root.getByRole('combobox', { name: 'Locale', exact: true });

  await input.evaluate((element) => {
    element.setAttribute('data-retained', 'yes');
  });

  for (const [locale, text] of [['ru-RU', '23:45'], ['en-US', '11:45'], ['en-GB', '23:45'], ['en-US', '11:45']]) {
    await localeSelect.selectOption(locale);
    await expect(input).toHaveValue(text);
    await expect(input).toHaveAttribute('data-retained', 'yes');
    await expect(model).toHaveText('23:45:56.123456789');
    await expect(model).toHaveAttribute('data-initial-identity', 'true');
    await expect(model).toHaveAttribute('data-updates', '0');
    await expect(root.locator('.DrInputTime__periodButton')).toHaveCount(locale === 'en-US' ? 4 : 0);
  }

  await localeSelect.selectOption('ru-RU');
  await input.fill('23:14');
  await selectInputRange(input, 4, 5);
  await input.press('5');
  await expect(model).toHaveText('23:15:56.123456789');
  await localeSelect.selectOption('en-GB');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('23:14');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(model).toHaveText('23:15:56.123456789');
  await input.fill('23:1');
  await expect(model).toHaveText('null');
  const draftUpdates = await model.getAttribute('data-updates');

  await localeSelect.selectOption('en-US');
  await expect(input).toHaveValue('');
  await expect(model).toHaveText('null');
  await expect(model).toHaveAttribute('data-updates', draftUpdates ?? '');
});

test('time inherits nested locale while language changes only translate the period action', async ({ mount }) => {
  const root = await mount('configuration/components/DrConfigProvider/DrConfigProviderGallery');
  const configured = root.getByTestId('configured');
  const nested = root.getByTestId('nested');
  const input = configured.getByRole('textbox', { name: 'Time', exact: true });
  const nestedInput = nested.getByRole('textbox', { name: 'Time', exact: true });
  const languageSelect = root.getByRole('combobox', { name: 'Language', exact: true });
  const localeSelect = root.getByRole('combobox', { name: 'Locale', exact: true });

  await expect(input).toHaveValue('11:15');
  await expect(configured.getByRole('button', { name: 'Switch Time to AM', exact: true })).toHaveText('PM');
  await expect(nestedInput).toHaveValue('23:15');
  await expect(nested.locator('.DrInputTime__periodButton')).toHaveCount(0);
  await languageSelect.selectOption('ru');
  await expect(input).toHaveValue('23:15');
  await languageSelect.selectOption('en');
  await expect(input).toHaveValue('11:15');
  await localeSelect.selectOption('en-US');
  await expect(nestedInput).toHaveValue('11:15');
  await input.fill('11:14');
  await selectInputRange(input, 4, 5);
  await input.press('5');
  await languageSelect.selectOption('ru');
  await expect(input).toHaveValue('11:15');
  await expect(configured.getByRole('button', { name: 'Переключить поле «Time» на AM', exact: true })).toHaveText('PM');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('11:14');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue('11:15');
  await localeSelect.selectOption('en-GB');
  await expect(input).toHaveValue('23:15');
  await expect(nestedInput).toHaveValue('23:15');
  await expect(root.locator('.DrInputTime__periodButton')).toHaveCount(0);
});
