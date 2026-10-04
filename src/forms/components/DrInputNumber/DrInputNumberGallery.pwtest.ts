import { expect, test } from '~/tests/playwright/fixtures';

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

  for (const name of ['Увеличить значение', 'Уменьшить значение', 'Изменить знак']) {
    await expect(component.getByRole('button', { name: `${name} поля «Read-only temperature»` })).toBeDisabled();
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
