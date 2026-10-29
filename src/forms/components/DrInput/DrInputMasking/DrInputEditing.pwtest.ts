import { maskingStoryId as storyId } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { expect, test } from '~/tests/playwright/fixtures';

const numberGroup = getInputLocaleProfile('en-US').number.group;

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
