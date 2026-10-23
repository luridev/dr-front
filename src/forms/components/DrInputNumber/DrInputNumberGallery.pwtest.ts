import { maskingStoryId as storyId } from '@/forms/components/DrInput/DrInputMasking/config.support';
import {
  getInput,
  pasteInput,
  readSelection,
  replaceInput,
  selectInputRange,
} from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { expect, test } from '~/tests/playwright/fixtures';

const group = getInputLocaleProfile('en-US').number.group;
const numberStoryId = 'forms/components/DrInputNumber/DrInputNumberGallery';

test('regional zero drafts keep their text on blur while exposing canonical integer models', async ({ mount }) => {
  const root = await mount(numberStoryId);
  const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
  const model = root.getByTestId('number-gallery-model');

  for (const locale of ['ru-RU', 'en-US', 'en-GB'] as const) {
    await root.getByRole('combobox', { name: 'Locale', exact: true }).selectOption(locale);
    const separator = getInputLocaleProfile(locale).number.group;

    for (const [source, display, value] of [['-0', '-0', '0'], ['-00123', `-00${separator}123`, '-123']]) {
      await replaceInput(input, source);
      await expect(input).toHaveValue(display);
      await expect(model).toHaveText(value);
      await expect(input).toHaveAttribute('aria-valuenow', value);
      await input.press('Tab');
      await expect(input).toHaveValue(display);
      await expect(model).toHaveText(value);
    }
  }
});

test('readonly number blocks user changes and wheel cancellation while accepting parent updates', async ({
  mount,
  page,
}) => {
  const component = await mount(numberStoryId);
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

  await expect(input).toHaveValue(`1${group}234`);
  await expect(root.getByTestId('number-model')).toHaveText('1234');

  for (const source of ['9007199254740991', '-9007199254740991', '0', '-42']) {
    await replaceInput(input, source);
    await expect(root.getByTestId('number-model')).toHaveText(source);
  }

  await input.fill('123');
  await input.press('End');
  await input.press('4');
  await expect(input).toHaveValue(`1${group}234`);
  expect(await readSelection(input)).toEqual([5, 5]);
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('123');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue(`1${group}234`);
  await selectInputRange(input, 3);
  await input.press('Backspace');
  await expect(input).toHaveValue('134');
  await expect(root.getByTestId('number-model')).toHaveText('134');
  await input.fill('1234');
  await selectInputRange(input, 3);
  await input.press('Delete');
  await expect(input).toHaveValue('124');
  await expect(root.getByTestId('number-model')).toHaveText('124');
  await input.fill('1234567');
  await selectInputRange(input, 2, 5);
  await pasteInput(input, '98');
  await expect(input).toHaveValue(`198${group}567`);
  await expect(root.getByTestId('number-model')).toHaveText('198567');
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

test('number changes its locale without remounting or emitting a model update', async ({ mount, page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  const root = await mount(numberStoryId);
  const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
  const model = root.getByTestId('number-gallery-model');
  const localeSelect = root.getByRole('combobox', { name: 'Locale', exact: true });

  await input.focus();

  await input.evaluate((element: HTMLInputElement) => {
    element.setAttribute('data-retained', 'yes');
    element.setSelectionRange(2, 5, 'backward');
  });

  for (const locale of ['ru-RU', 'en-US', 'en-GB', 'ru-RU'] as const) {
    const separator = getInputLocaleProfile(locale).number.group;

    await localeSelect.selectOption(locale);
    await expect(input).toHaveValue(`1${separator}234${separator}567`);
    await expect(input).toHaveAttribute('data-retained', 'yes');
    expect(await readSelection(input)).toEqual([2, 5]);
    expect(await input.evaluate((element: HTMLInputElement) => element.selectionDirection)).toBe('backward');
    await expect(model).toHaveText('1234567');
    await expect(model).toHaveAttribute('data-updates', '0');
  }

  const russianGroup = getInputLocaleProfile('ru-RU').number.group;

  await input.fill('999');
  await root.getByRole('button', { name: 'Увеличить значение поля «Optional»', exact: true }).click();
  await expect(input).toHaveValue(`1${russianGroup}000`);
  await expect(model).toHaveText('1000');
  await expect(model).toHaveAttribute('data-updates', '2');
  await localeSelect.selectOption('en-US');
  await expect(input).toHaveValue(`1${group}000`);
  await expect(model).toHaveAttribute('data-updates', '2');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('999');
  await input.dispatchEvent('wheel', { deltaY: -100 });
  await expect(input).toHaveValue(`1${group}000`);
  await root.getByRole('button', { name: 'Change sign of Optional', exact: true }).click();
  await expect(input).toHaveValue(`-1${group}000`);
  await expect(model).toHaveText('-1000');

  for (const locale of ['ru-RU', 'en-US', 'en-GB'] as const) {
    const separator = getInputLocaleProfile(locale).number.group;

    await localeSelect.selectOption(locale);
    await input.fill('');
    await page.evaluate((text) => navigator.clipboard.writeText(text), `-12${separator}345`);
    await input.press('ControlOrMeta+V');
    await expect(input).toHaveValue(`-12${separator}345`);
    await expect(model).toHaveText('-12345');
  }
});

test('number inherits configuration while language-only changes preserve the mask history', async ({ mount }) => {
  const root = await mount('configuration/components/DrConfigProvider/DrConfigProviderGallery');
  const configured = root.getByTestId('configured');
  const nested = root.getByTestId('nested');
  const input = configured.getByRole('spinbutton', { name: 'Count', exact: true });
  const nestedInput = nested.getByRole('spinbutton', { name: 'Count', exact: true });
  const languageSelect = root.getByRole('combobox', { name: 'Language', exact: true });
  const localeSelect = root.getByRole('combobox', { name: 'Locale', exact: true });
  const russianGroup = getInputLocaleProfile('ru-RU').number.group;

  await input.fill('1234');
  await nestedInput.fill('1234');
  await expect(input).toHaveValue(`1${group}234`);
  await expect(nestedInput).toHaveValue(`1${russianGroup}234`);
  await languageSelect.selectOption('ru');
  await expect(input).toHaveValue(`1${russianGroup}234`);
  await languageSelect.selectOption('en');
  await expect(input).toHaveValue(`1${group}234`);
  await expect(nestedInput).toHaveValue(`1${russianGroup}234`);
  await localeSelect.selectOption('en-US');
  await expect(nestedInput).toHaveValue(`1${group}234`);
  await input.fill('123');
  await input.press('End');
  await input.press('4');
  await languageSelect.selectOption('ru');
  await expect(input).toHaveValue(`1${group}234`);
  await expect(configured.getByRole('button', { name: 'Увеличить значение поля «Count»', exact: true })).toBeVisible();
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('123');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue(`1${group}234`);
  await localeSelect.selectOption('en-GB');
  await expect(input).toHaveValue(`1${getInputLocaleProfile('en-GB').number.group}234`);
  await expect(nestedInput).toHaveValue(`1${getInputLocaleProfile('en-GB').number.group}234`);
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('123');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue(`1${getInputLocaleProfile('en-GB').number.group}234`);
});
