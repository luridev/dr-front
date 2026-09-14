import { maskingStoryInitialTime } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';
import { expect, test } from '~/tests/playwright/fixtures';
import type { Locator } from '@playwright/test';

const storyId = 'forms/components/DrInput/DrInputMasking/DrInputMasking';

function getInput(component: Locator, name: string): Locator {
  return component.locator(`.DrInputMasking__${name} > .DrControl__control > input`);
}

async function selectInputRange(input: Locator, from: number, to = from): Promise<void> {
  await input.focus();

  await input.evaluate((element: HTMLInputElement, range) => {
    element.setSelectionRange(range.from, range.to);
  }, { from, to });
}

function readSelection(input: Locator): Promise<Array<number | null>> {
  return input.evaluate((element: HTMLInputElement) => [element.selectionStart, element.selectionEnd]);
}

test('typed wrappers изолируют slot inputs и выбирают ближайший provider', async ({ mount }) => {
  const component = await mount(storyId);
  const date = getInput(component, 'date');
  const plain = getInput(component, 'dateSlot');

  await date.fill('05092026');
  await expect(date).toHaveValue('05.09.2026');
  await expect(component.getByTestId('date-model')).toHaveText('2026-09-05');
  await expect(date).toHaveAttribute('inputmode', 'text');

  await plain.fill('plain text / 123');
  await expect(plain).toHaveValue('plain text / 123');
  await expect(plain).not.toHaveAttribute('inputmode');

  const integer = getInput(component, 'integerSlot');

  await integer.fill('12345');
  await expect(integer).toHaveValue(`12${integerInputParams.thousandSeparator}345`);
  await expect(integer).toHaveAttribute('inputmode', 'numeric');

  const time = getInput(component, 'nestedTime');
  const nestedPlain = getInput(component, 'nestedTimeSlot');

  await time.fill('1234');
  await expect(time).toHaveValue('12:34');
  await expect(time).toHaveAttribute('inputmode', 'numeric');
  await nestedPlain.fill('nested plain input');
  await expect(nestedPlain).toHaveValue('nested plain input');
  await expect(nestedPlain).not.toHaveAttribute('inputmode');
});

test('number label slot изолирован, integer model и controls продолжают работать', async ({ mount }) => {
  const component = await mount(storyId);
  const number = getInput(component, 'number');
  const plain = getInput(component, 'numberSlot');
  const wrapper = component.locator('.DrInputMasking__number');

  await expect(number).toHaveValue(`1${integerInputParams.thousandSeparator}234`);
  await expect(number).toHaveAttribute('role', 'spinbutton');
  await plain.fill('number slot / text');
  await expect(plain).toHaveValue('number slot / text');
  await expect(plain).not.toHaveAttribute('inputmode');

  await number.fill('21');
  await wrapper.locator('.DrInputNumber__stepperButton').first().click();
  await expect(component.getByTestId('number-model')).toHaveText('22');
  await wrapper.locator('.DrInputNumber__signButton').click();
  await expect(number).toHaveValue('-22');
  await expect(component.getByTestId('number-model')).toHaveText('-22');
});

test('смена time precision обновляет реальную маску без remount, изменения модели и потери focus', async ({ mount }) => {
  const component = await mount(storyId);
  const time = getInput(component, 'time');
  const nativeInput = await time.elementHandle();

  expect(nativeInput).not.toBeNull();
  await time.focus();
  await expect(time).toHaveValue('12:34');

  const precisions = [
    { smallestUnit: 'nanosecond', value: maskingStoryInitialTime },
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
});

test('time сохраняет middle editing, selection, delete/backspace и paste lifecycle', async ({ mount }) => {
  const component = await mount(storyId, { smallestUnit: 'second' });
  const time = getInput(component, 'time');

  await selectInputRange(time, 3);
  await time.pressSequentially('5');
  await expect(time).toHaveValue('12:54:56');
  await expect.poll(() => readSelection(time)).toEqual([4, 4]);

  await selectInputRange(time, 3, 5);
  await time.pressSequentially('45');
  await expect(time).toHaveValue('12:45:56');
  await expect.poll(() => readSelection(time)).toEqual([6, 6]);

  await selectInputRange(time, 5);
  await time.press('Backspace');
  await expect(time).toHaveValue('12:40:56');
  await expect.poll(() => readSelection(time)).toEqual([4, 4]);
  await selectInputRange(time, 3);
  await time.press('Delete');
  await expect(time).toHaveValue('12:00:56');
  await expect.poll(() => readSelection(time)).toEqual([3, 3]);

  await selectInputRange(time, 0, 8);

  await time.evaluate((element: HTMLInputElement) => {
    const text = '235958';
    const data = new DataTransfer();

    data.setData('text/plain', text);
    element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));

    const shouldInsert = element.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertFromPaste',
      data: text,
      dataTransfer: data,
      bubbles: true,
      cancelable: true,
    }));

    if (shouldInsert) {
      element.setRangeText(text, element.selectionStart ?? 0, element.selectionEnd ?? 0, 'end');
      element.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', data: text, bubbles: true }));
    }
  });

  await expect(time).toHaveValue('23:59:58');
  await expect.poll(() => readSelection(time)).toEqual([8, 8]);
  await expect(component.getByTestId('time-model')).toHaveText('23:59:58');
  await expect(time).toBeFocused();
});

test('conditional remount получает актуальную precision вместо старой mask', async ({ mount }) => {
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
