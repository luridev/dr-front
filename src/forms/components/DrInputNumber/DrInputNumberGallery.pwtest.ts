import { maskingStoryId as storyId } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput, pasteInput, replaceInput } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

const group = '\u00a0';

test('readonly number blocks user changes and wheel cancellation while accepting parent updates', async ({
  mount,
  page,
}) => {
  const component = await mount('forms/components/DrInputNumber/DrInputNumberGallery');
  const input = component.getByRole('spinbutton', { name: 'Read-only temperature', exact: true });
  const temperature = component.getByRole('spinbutton', { name: 'Temperature', exact: true });

  await expect(input).toBeEnabled();
  await expect(input).toHaveAttribute('readonly', '');
  await input.focus();
  await expect(input).toBeFocused();
  await page.keyboard.type('123');
  await expect(input).toHaveValue('-5');
  await page.keyboard.press('ArrowUp');
  await expect(input).toHaveValue('-5');
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveValue('-5');

  for (const name of ['Increase Read-only temperature', 'Decrease Read-only temperature', 'Change sign of Read-only temperature']) {
    await expect(component.getByRole('button', { name, exact: true })).toBeDisabled();
  }

  await expect(component.getByRole('button', { name: 'Clear read-only temperature', exact: true })).toHaveCount(0);

  const wheelPrevented = await input.evaluate((element) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100 });

    element.dispatchEvent(event);

    return event.defaultPrevented;
  });

  expect(wheelPrevented).toBe(false);
  await expect(input).toHaveValue('-5');
  await expect(temperature).toHaveValue('-5');

  await temperature.fill('15');
  await expect(input).toHaveValue('15');
  await expect(component.getByRole('spinbutton', { name: 'Disabled', exact: true })).toBeDisabled();
});

test('number preserves unsafe drafts and supports grouping, history and step bounds', async ({ mount }) => {
  const root = await mount(storyId);
  const input = getInput(root, 'number');
  const wrapper = root.locator('.DrInputMasking__number');

  for (const source of ['9007199254740991', '-9007199254740991', '0', '-42']) {
    await replaceInput(input, source);
    await expect(root.getByTestId('number-model')).toHaveText(source);
  }

  await input.fill('123');
  await input.press('End');
  await input.press('4');
  await expect(input).toHaveValue(`1${group}234`);
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('123');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue(`1${group}234`);
  await replaceInput(input, '9007199254740991');
  await input.press('2');
  expect((await input.inputValue()).replaceAll(group, '')).toBe('90071992547409912');
  await expect(root.getByTestId('number-model')).toHaveText('');
  await input.press('Tab');
  await input.focus();
  expect((await input.inputValue()).replaceAll(group, '')).toBe('90071992547409912');
  await input.fill('');
  await pasteInput(input, '9007199254740993');
  expect((await input.inputValue()).replaceAll(group, '')).toBe('9007199254740993');
  await expect(root.getByTestId('number-model')).toHaveText('');
  await root.update({ externalNumber: 5, min: -5, max: 7, step: 2 });
  await wrapper.locator('.DrInputNumber__stepperButton').first().click();
  await expect(root.getByTestId('number-model')).toHaveText('7');
  await expect(wrapper.locator('.DrInputNumber__stepperButton').first()).toBeDisabled();
  await wrapper.locator('.DrInputNumber__stepperButton').last().click();
  await expect(root.getByTestId('number-model')).toHaveText('5');
  await wrapper.locator('.DrInput__clearButton').click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await input.press('-');
  await expect(input).toHaveValue('-');
  await input.press('Tab');
  await expect(input).toHaveValue('');
});
