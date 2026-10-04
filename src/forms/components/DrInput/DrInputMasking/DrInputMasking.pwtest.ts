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

test('typed wrappers isolate slot inputs and use the nearest provider', async ({ mount }) => {
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

test('number label slot is isolated while the integer model and controls keep working', async ({ mount }) => {
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

test('time precision changes update the mask without remounting, model changes or focus loss', async ({ mount }) => {
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

test('read-only typed inputs block editing and mask history until made writable again', async ({ mount }) => {
  const component = await mount(storyId);

  const fields = [
    { name: 'date', text: '05092026', value: '05.09.2026', model: '2026-09-05' },
    { name: 'number', text: '42', value: '42', model: '42' },
    { name: 'time', text: '2359', value: '23:59', model: '23:59:00' },
  ];

  for (const field of fields) {
    await getInput(component, field.name).fill(field.text);
  }

  await component.update({ readonly: true });

  for (const field of fields) {
    const input = getInput(component, field.name);

    await expect(input).toHaveAttribute('readonly', '');
    await expect(input).toBeEnabled();
    await input.focus();
    await input.press('ControlOrMeta+A');
    await input.pressSequentially('123');
    await input.press('Backspace');
    await input.press('ArrowUp');
    await input.press('ControlOrMeta+Z');
    await expect(input).toHaveValue(field.value);
    await input.press('ControlOrMeta+Shift+Z');
    await expect(input).toHaveValue(field.value);
    await expect(component.getByTestId(`${field.name}-model`)).toHaveText(field.model);
  }

  await component.update({ readonly: false });
  await getInput(component, 'date').fill('01022027');
  await expect(component.getByTestId('date-model')).toHaveText('2027-02-01');
  await getInput(component, 'time').fill('0930');
  await expect(component.getByTestId('time-model')).toHaveText('09:30:00');
  await getInput(component, 'number').fill('1234');
  await expect(getInput(component, 'number')).toHaveValue(`1${integerInputParams.thousandSeparator}234`);

  await getInput(component, 'number').fill('-');
  await component.update({ readonly: true });
  await getInput(component, 'number').press('Tab');
  await expect(getInput(component, 'number')).toHaveValue('-');
  await expect(component.getByTestId('number-model')).toHaveText('');
});
