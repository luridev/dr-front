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

test('number range errors and explicit ARIA overrides preserve the model, status and visual state', async ({ mount }) => {
  const bounds = { min: 1, max: 10 };
  const root = await mount(numberStoryId, { ...bounds, externalAmount: 5 });
  const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
  const control = input.locator('xpath=ancestor::*[@data-dr-focus-surface][1]');
  const model = root.getByTestId('number-gallery-model');
  const status = root.getByTestId('number-gallery-status');
  const override = root.getByRole('combobox', { name: 'Optional ARIA invalid', exact: true });
  const increase = root.getByRole('button', { name: 'Increase Optional', exact: true });
  const decrease = root.getByRole('button', { name: 'Decrease Optional', exact: true });

  await expect(input).not.toHaveAttribute('aria-invalid');
  await input.fill('100');
  await expect(input).toHaveValue('100');
  await expect(model).toHaveText('100');
  await expect(status).toHaveText('valid');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-valuenow', '100');
  await expect(input).toHaveAttribute('aria-valuemin', '1');
  await expect(input).toHaveAttribute('aria-valuemax', '10');
  await expect(control).not.toHaveClass(/DrControl__control_error/);
  await expect(increase).toBeDisabled();
  await expect(decrease).toBeEnabled();

  await override.selectOption({ label: 'false' });
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await root.update({ ...bounds, state: 'error' });
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(control).toHaveClass(/DrControl__control_error/);
  await expect(input).toHaveAttribute('aria-valuenow', '100');
  await expect(increase).toBeDisabled();
  await expect(decrease).toBeEnabled();
  await expect(model).toHaveAttribute('data-updates', '1');

  await override.selectOption({ label: 'Automatic' });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await input.fill('5');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await root.update(bounds);
  await expect(input).not.toHaveAttribute('aria-invalid');
  await override.selectOption({ label: 'true' });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(control).not.toHaveClass(/DrControl__control_error/);
  await override.selectOption({ label: 'Automatic' });
  await expect(input).not.toHaveAttribute('aria-invalid');

  await root.update({ min: 6, max: 10 });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-valuemin', '6');
  await root.update({ min: 1, max: 4 });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-valuemax', '4');
  await root.update({ min: 5, max: 5 });
  await expect(input).not.toHaveAttribute('aria-invalid');
  await expect(increase).toBeDisabled();
  await expect(decrease).toBeDisabled();
  await expect(model).toHaveText('5');
  await expect(model).toHaveAttribute('data-updates', '2');
  await expect(status).toHaveText('valid');
  await expect(status).toHaveAttribute('data-updates', '1');

  await root.update(bounds);
  await input.fill('0');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await input.fill('1');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await input.fill('100');
  await decrease.click();
  await expect(input).toHaveValue('10');
  await expect(input).not.toHaveAttribute('aria-invalid');

  for (const [draft, expectedStatus] of [['-', 'incomplete'], ['+1', 'invalid'], ['9'.repeat(400), 'out-of-range']]) {
    await input.fill(draft);
    await expect(status).toHaveText(expectedStatus);
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(increase).toBeDisabled();
    await expect(decrease).toBeDisabled();
  }
});

test('number ARIA uses existing optional and invalid bounds semantics', async ({ mount }) => {
  const root = await mount(numberStoryId, { externalAmount: 5 });
  const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });

  for (const { bounds, invalid } of [
    { bounds: {}, invalid: false },
    { bounds: { min: null, max: null }, invalid: false },
    { bounds: { min: 6 }, invalid: true },
    { bounds: { max: 4 }, invalid: true },
    { bounds: { min: 10, max: 1 }, invalid: false },
    { bounds: { min: Number.NaN }, invalid: false },
    { bounds: { max: Number.POSITIVE_INFINITY }, invalid: false },
    { bounds: { min: 1.5 }, invalid: false },
    { bounds: { max: Number.MAX_SAFE_INTEGER + 1 }, invalid: false },
  ]) {
    await root.update(bounds);

    if (invalid) {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    } else {
      await expect(input).not.toHaveAttribute('aria-invalid');
    }

    await expect(input).toHaveAttribute('aria-valuenow', '5');
    await expect(root.getByTestId('number-gallery-model')).toHaveAttribute('data-updates', '0');
    await expect(root.getByTestId('number-gallery-status')).toHaveAttribute('data-updates', '1');
  }
});

test('number publishes draft statuses through blur, clear, external updates and locale changes', async ({ mount }) => {
  const root = await mount(numberStoryId, { externalAmount: null });
  const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
  const model = root.getByTestId('number-gallery-model');
  const status = root.getByTestId('number-gallery-status');
  const sign = root.getByRole('button', { name: 'Change sign of Optional', exact: true });

  await expect(status).toHaveText('empty');
  await expect(status).toHaveAttribute('data-updates', '1');
  await expect(model).toHaveAttribute('data-updates', '0');
  await expect(input).toHaveAttribute('aria-valuetext', 'No value specified');
  await sign.click();
  await expect(input).toHaveValue('-');
  await expect(status).toHaveText('incomplete');
  await expect(model).toHaveText('null');
  await expect(sign).toBeEnabled();
  await sign.click();
  await expect(status).toHaveText('empty');

  await input.fill('-');
  await expect(status).toHaveText('incomplete');
  await input.press('Tab');
  await expect(input).toHaveValue('');
  await expect(status).toHaveText('empty');

  await input.fill('123');
  await expect(status).toHaveText('valid');
  const validUpdates = await status.getAttribute('data-updates');

  for (const [draft, value] of [['-001', '-1'], ['-0', '0'], ['3000000000', '3000000000']]) {
    await input.fill(draft);
    await expect(model).toHaveText(value);
    await expect(input).toHaveAttribute('aria-valuenow', value);
    await expect(status).toHaveText('valid');
    await expect(status).toHaveAttribute('data-updates', validUpdates ?? '');
  }

  await input.fill('9007199254740992');
  await expect(status).toHaveText('out-of-range');
  const rangeUpdates = await status.getAttribute('data-updates');
  await input.fill('9'.repeat(400));
  await expect(status).toHaveAttribute('data-updates', rangeUpdates ?? '');

  for (const locale of ['ru-RU', 'en-GB', 'en-US'] as const) {
    await root.getByRole('combobox', { name: 'Locale', exact: true }).selectOption(locale);
    expect((await input.inputValue()).replaceAll(getInputLocaleProfile(locale).number.group, '')).toBe('9'.repeat(400));
    await expect(model).toHaveText('null');
    await expect(status).toHaveText('out-of-range');
    await expect(status).toHaveAttribute('data-updates', rangeUpdates ?? '');
  }

  await root.getByRole('button', { name: 'Clear optional number', exact: true }).click();
  await expect(status).toHaveText('empty');
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await root.getByRole('button', { name: 'Increase Optional', exact: true }).click();
  await expect(model).toHaveText('1');
  await expect(status).toHaveText('valid');
  await input.fill('');
  await root.getByRole('button', { name: 'Decrease Optional', exact: true }).click();
  await expect(model).toHaveText('-1');

  const modelUpdates = await model.getAttribute('data-updates');
  await root.update({ externalAmount: 42 });
  await expect(input).toHaveValue('42');
  await expect(status).toHaveText('valid');
  await root.update({ externalAmount: null });
  await expect(input).toHaveValue('');
  await expect(status).toHaveText('empty');
  await expect(model).toHaveAttribute('data-updates', modelUpdates ?? '');
});

for (const { source, expectedStatus } of [
  { source: '-', expectedStatus: 'incomplete' },
  { source: '+1', expectedStatus: 'invalid' },
  { source: '9'.repeat(400), expectedStatus: 'out-of-range' },
]) {
  test(`number disables every stepping route for ${expectedStatus} and recovers after correction`, async ({ mount, page }) => {
    const root = await mount(numberStoryId);
    const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
    const model = root.getByTestId('number-gallery-model');
    const status = root.getByTestId('number-gallery-status');
    const increase = root.getByRole('button', { name: 'Increase Optional', exact: true });
    const decrease = root.getByRole('button', { name: 'Decrease Optional', exact: true });

    await input.fill(source);
    const draft = await input.inputValue();
    await expect(status).toHaveText(expectedStatus);
    await expect(model).toHaveText('null');
    await expect(increase).toBeDisabled();
    await expect(decrease).toBeDisabled();
    await expect(input).not.toHaveAttribute('aria-valuenow');
    await expect(input).not.toHaveAttribute('aria-invalid');

    await expect(input).toHaveAttribute('aria-valuetext', expectedStatus === 'incomplete'
      ? 'Negative number entry is incomplete'
      : draft);

    await selectInputRange(input, 0, Math.min(draft.length, 2));
    const selection = await readSelection(input);

    await increase.click({ force: true });
    await decrease.click({ force: true });
    await input.press('ArrowUp');
    await input.press('ArrowDown');

    for (const deltaY of [-100, 100]) {
      const prevented = await input.evaluate((element, delta) => {
        const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: delta });
        element.dispatchEvent(event);

        return event.defaultPrevented;
      }, deltaY);

      expect(prevented).toBe(false);
    }

    await page.evaluate(() => {
      document.body.style.minHeight = '200vh';
    });

    await input.hover();
    const scrollBeforeWheel = await page.evaluate(() => window.scrollY);

    await page.mouse.wheel(0, 100);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBeforeWheel);

    await expect(input).toHaveValue(draft);
    await expect(input).toBeFocused();
    expect(await readSelection(input)).toEqual(selection);
    await expect(model).toHaveText('null');
    await expect(status).toHaveText(expectedStatus);

    await input.fill('12');
    await expect(status).toHaveText('valid');
    await expect(increase).toBeEnabled();
    await expect(decrease).toBeEnabled();
    await increase.click();
    await expect(model).toHaveText('13');
    await input.press('ArrowDown');
    await expect(model).toHaveText('12');
    await input.dispatchEvent('wheel', { deltaY: -100 });
    await expect(model).toHaveText('13');
  });
}

test('number diagnoses unsupported external models and keeps business bounds separate', async ({ mount }) => {
  const root = await mount(numberStoryId);
  const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
  const status = root.getByTestId('number-gallery-status');

  for (const [externalAmount, expectedStatus] of [
    [1.5, 'invalid'], [Number.NaN, 'invalid'], [Number.POSITIVE_INFINITY, 'invalid'],
    [Number.MAX_SAFE_INTEGER + 1, 'out-of-range'], [Number.MIN_SAFE_INTEGER - 1, 'out-of-range'],
  ] as const) {
    await root.update({ externalAmount, min: 1, max: 10 });
    await expect(status).toHaveText(expectedStatus);
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).not.toHaveAttribute('aria-valuenow');
    await expect(root.getByRole('button', { name: 'Increase Optional', exact: true })).toBeDisabled();
    await expect(root.getByRole('button', { name: 'Decrease Optional', exact: true })).toBeDisabled();
  }

  await root.update({ externalAmount: 3 });
  await expect(status).toHaveText('valid');
  await expect(root.getByTestId('number-gallery-model')).toHaveAttribute('data-updates', '0');

  const quantity = root.getByRole('spinbutton', { name: 'Quantity', exact: true });
  await quantity.fill('3000000000');
  await expect(quantity).toHaveAttribute('aria-valuenow', '3000000000');
  await expect(quantity).toHaveAttribute('aria-valuemin', '1');
  await expect(quantity).toHaveAttribute('aria-valuemax', '10');
  await expect(quantity).toHaveAttribute('aria-invalid', 'true');
  await expect(quantity).toHaveAccessibleDescription('1–10 · Step 1');
  await expect(root.getByRole('button', { name: 'Increase Quantity', exact: true })).toBeDisabled();
  const decrease = root.getByRole('button', { name: 'Decrease Quantity', exact: true });
  await expect(decrease).toBeEnabled();
  await decrease.click();
  await expect(quantity).toHaveValue('10');
  await expect(quantity).not.toHaveAttribute('aria-invalid');
});

for (const interaction of ['mouse', 'touch'] as const) {
  test.describe(`number controls with ${interaction}`, () => {
    test.use(interaction === 'touch'
      ? { hasTouch: true, isMobile: true, viewport: { width: 360, height: 740 } }
      : { hasTouch: false, isMobile: false, viewport: { width: 1280, height: 720 } });

    test('change an unfocused input without focus events or scrolling', async ({ mount, page }) => {
      const root = await mount(numberStoryId);
      const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
      const model = root.getByTestId('number-gallery-model');
      const localeSelect = root.getByRole('combobox', { name: 'Locale', exact: true });

      const focusEvents = await input.evaluateHandle((element) => {
        const events: Array<string> = [];

        for (const type of ['focus', 'blur']) {
          element.addEventListener(type, () => events.push(type));
        }

        return events;
      });

      await localeSelect.focus();
      await input.scrollIntoViewIfNeeded();
      const scroll = await page.evaluate(() => [window.scrollX, window.scrollY]);

      for (const [name, value] of [
        ['Increase Optional', '1234568'],
        ['Decrease Optional', '1234567'],
        ['Change sign of Optional', '-1234567'],
      ]) {
        const button = root.getByRole('button', { name, exact: true });

        await expect(button).toHaveAttribute('tabindex', '-1');
        await expect(button).toHaveAttribute('aria-controls', await input.getAttribute('id') ?? '');
        await button[interaction === 'touch' ? 'tap' : 'click']();
        await expect(model).toHaveText(value);
        await expect(input).toHaveAttribute('aria-valuenow', value);
        expect(await input.evaluate((element) => document.activeElement === element)).toBe(false);
        await expect(localeSelect).toBeFocused();
        expect(await focusEvents.jsonValue()).toEqual([]);
        expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual(scroll);
      }

      await input.fill('');
      await localeSelect.focus();
      const signButton = root.getByRole('button', { name: 'Change sign of Optional', exact: true });

      for (const draft of ['-', '']) {
        await signButton[interaction === 'touch' ? 'tap' : 'click']();
        await expect(input).toHaveValue(draft);
        await expect(model).toHaveText('null');
        await expect(localeSelect).toBeFocused();
        expect(await focusEvents.jsonValue()).toEqual(['focus', 'blur']);
      }
    });

    test('retain focus and caret behavior for buttons, arrows and subsequent editing', async ({ mount, page }) => {
      const root = await mount(numberStoryId);
      const input = root.getByRole('spinbutton', { name: 'Optional', exact: true });
      const model = root.getByTestId('number-gallery-model');

      const focusEvents = await input.evaluateHandle((element) => {
        const events: Array<string> = [];

        for (const type of ['focus', 'blur']) {
          element.addEventListener(type, () => events.push(type));
        }

        return events;
      });

      await input[interaction === 'touch' ? 'tap' : 'click']();
      await expect(input).toBeFocused();

      for (const [name, value] of [
        ['Increase Optional', '1234568'],
        ['Decrease Optional', '1234567'],
        ['Change sign of Optional', '-1234567'],
      ]) {
        await selectInputRange(input, 2, 5);
        await root.getByRole('button', { name, exact: true })[interaction === 'touch' ? 'tap' : 'click']();
        await expect(model).toHaveText(value);
        expect(await input.evaluate((element) => document.activeElement === element)).toBe(true);
        const end = (await input.inputValue()).length;

        expect(await readSelection(input)).toEqual([end, end]);
        expect(await focusEvents.jsonValue()).toEqual(['focus']);
      }

      await page.keyboard.press('ArrowUp');
      await expect(model).toHaveText('-1234566');
      await page.keyboard.press('ArrowDown');
      await expect(model).toHaveText('-1234567');
      await expect(input).toBeFocused();
      await page.keyboard.type('8');
      await expect(input).toHaveValue(`-12${group}345${group}678`);
      await expect(model).toHaveText('-12345678');
      await selectInputRange(input, 1, 3);
      await page.keyboard.type('9');
      await expect(input).toHaveValue(`-9${group}345${group}678`);
      await expect(model).toHaveText('-9345678');
      expect(await focusEvents.jsonValue()).toEqual(['focus']);
      await root.getByRole('combobox', { name: 'Locale', exact: true }).focus();
      expect(await focusEvents.jsonValue()).toEqual(['focus', 'blur']);
    });
  });
}

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

  for (const label of ['Read-only temperature', 'Disabled']) {
    for (const action of ['Increase', 'Decrease', 'Change sign of']) {
      await expect(component.getByRole('button', { name: `${action} ${label}`, exact: true })).toBeDisabled();
    }
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
  await root.update({ externalNumber: -4, min: -5, max: 7, step: 2 });
  await wrapper.locator('.DrInputNumber__stepperButton').last().click();
  await expect(root.getByTestId('number-model')).toHaveText('-5');
  await expect(wrapper.locator('.DrInputNumber__stepperButton').last()).toBeDisabled();
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
