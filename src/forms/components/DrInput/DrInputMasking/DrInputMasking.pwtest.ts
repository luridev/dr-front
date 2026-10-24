import { maskingStoryId as storyId } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { integerInputParams } from '@/forms/lib/inputFormats/integer/config';
import { expect, test } from '~/tests/playwright/fixtures';

const numberGroup = getInputLocaleProfile('en-US').number.group;

for (const name of ['dateSlot', 'number', 'date', 'time', 'integerSlot']) {
  test(`${name} gives explicit ariaInvalid priority without changing visual state or descriptions`, async ({ mount }) => {
    const message = 'Input guidance';
    const root = await mount(storyId, { message });
    const input = getInput(root, name);
    const control = input.locator('..');
    const value = await input.inputValue();
    const description = await input.getAttribute('aria-describedby');

    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).toHaveAccessibleDescription(message);

    for (const { state, ariaInvalid, expected } of [
      { state: 'error', ariaInvalid: undefined, expected: true },
      { state: 'error', ariaInvalid: false, expected: false },
      { state: 'normal', ariaInvalid: true, expected: true },
      { state: 'error', ariaInvalid: true, expected: true },
      { state: 'normal', ariaInvalid: false, expected: false },
      { state: 'normal', ariaInvalid: undefined, expected: false },
    ] as const) {
      await root.update({ state, aria: { ariaInvalid }, message });

      if (expected) {
        await expect(input).toHaveAttribute('aria-invalid', 'true');
      } else {
        await expect(input).not.toHaveAttribute('aria-invalid', 'true');
      }

      if (state === 'error') {
        await expect(control).toHaveClass(/DrControl__control_error/);
      } else {
        await expect(control).not.toHaveClass(/DrControl__control_error/);
      }

      await expect(input).toHaveValue(value);
      await expect(input).toHaveAttribute('aria-describedby', description ?? '');
      await expect(input).toHaveAccessibleDescription(message);
    }
  });
}

test('typed wrappers isolate slot inputs and use the nearest provider', async ({ mount }) => {
  const component = await mount(storyId);
  const date = getInput(component, 'date');
  const plain = getInput(component, 'dateSlot');

  await date.fill('09052026');
  await expect(date).toHaveValue('09/05/2026');
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

  await expect(number).toHaveValue(`1${numberGroup}234`);
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

test('read-only typed inputs block editing and mask history until made writable again', async ({ mount }) => {
  const component = await mount(storyId);

  const fields = [
    { name: 'date', text: '09052026', value: '09/05/2026', model: '2026-09-05' },
    { name: 'number', text: '42', value: '42', model: '42' },
    { name: 'time', text: '1159', value: '11:59', model: '23:59:56.123456789' },
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
    await input.press('Delete');
    await input.press('ArrowUp');
    await input.press('ControlOrMeta+Z');
    await expect(input).toHaveValue(field.value);
    await input.press('ControlOrMeta+Shift+Z');
    await expect(input).toHaveValue(field.value);
    await expect(component.getByTestId(`${field.name}-model`)).toHaveText(field.model);
  }

  await component.update({ readonly: false });
  await getInput(component, 'date').fill('02012027');
  await expect(component.getByTestId('date-model')).toHaveText('2027-02-01');
  await getInput(component, 'time').fill('0930');
  await expect(component.getByTestId('time-model')).toHaveText('21:30:56.123456789');
  await getInput(component, 'number').fill('1234');
  await expect(getInput(component, 'number')).toHaveValue(`1${numberGroup}234`);

  await getInput(component, 'number').fill('-');
  await component.update({ readonly: true });
  await getInput(component, 'number').press('Tab');
  await expect(getInput(component, 'number')).toHaveValue('-');
  await expect(component.getByTestId('number-model')).toHaveText('');
});

test('disabled typed inputs follow external models and keep full time precision', async ({ mount }) => {
  const root = await mount(storyId);
  await root.update({ disabled: true, externalDate: '0010-02-01', externalNumber: 12345, externalTime: '01:02:03.004005006' });

  for (const [name, text] of [['date', '02/01/0010'], ['number', `12${numberGroup}345`], ['time', '01:02']]) {
    await expect(getInput(root, name)).toBeDisabled();
    await expect(getInput(root, name)).toHaveValue(text);
  }

  await expect(root.getByTestId('time-model')).toHaveText('01:02:03.004005006');
  await root.update({ disabled: false, smallestUnit: 'nanosecond' });
  await expect(getInput(root, 'time')).toHaveValue('01:02:03.004005006');
});
