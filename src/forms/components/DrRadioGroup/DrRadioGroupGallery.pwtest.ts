import { expect, test } from '~/tests/playwright/fixtures';
import type { Locator } from '@playwright/test';

const story = 'forms/components/DrRadioGroup/DrRadioGroupGallery';

async function expectSelection(component: Locator, index: number) {
  const group = component.getByRole('radiogroup', { name: 'Values', exact: true });
  const checked = [index === 0, index === 1];

  await expect.poll(async () => ({
    inputs: await group.getByRole('radio').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).checked)),
    slots: await group.getByTestId('value-slot').evaluateAll((slots) => slots.map((slot) => slot.getAttribute('data-checked') === 'true')),
    modelIndex: await component.getByTestId('value-model').getAttribute('data-selected-index'),
  })).toEqual({ inputs: checked, slots: checked, modelIndex: String(index) });
}

test('independent radio groups retain native names, arrow boundaries and Tab navigation', async ({ mount, page }) => {
  const component = await mount(story);
  const row = component.getByRole('radiogroup', { name: 'Row', exact: true });
  const column = component.getByRole('radiogroup', { name: 'Column', exact: true });
  const rowRadios = row.getByRole('radio');
  const columnRadios = column.getByRole('radio');
  const rowName = await rowRadios.first().getAttribute('name');
  const columnName = await columnRadios.first().getAttribute('name');

  expect(rowName).toBeTruthy();
  expect(columnName).toBeTruthy();
  expect(rowName).not.toBe(columnName);

  await rowRadios.first().focus();
  await page.keyboard.press('ArrowLeft');
  await expect(row.locator(':focus')).toHaveCount(1);
  await rowRadios.last().focus();
  await page.keyboard.press('ArrowRight');
  await expect(row.locator(':focus')).toHaveCount(1);
  await rowRadios.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(rowRadios.nth(1)).toBeChecked();
  await expect(columnRadios.nth(1)).toBeChecked();

  await page.keyboard.press('Tab');
  await expect(columnRadios.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(columnRadios.last()).toBeChecked();
  await expect(rowRadios.nth(1)).toBeChecked();
  await page.keyboard.press('Shift+Tab');
  await expect(rowRadios.nth(1)).toBeFocused();
  await expect(component.getByText('Row: Pickup point · Column: In store', { exact: true })).toBeVisible();

  await rowRadios.first().press('Space');
  await expect(rowRadios.first()).toBeChecked();
  await expect(component.getByText('Row: Courier · Column: In store', { exact: true })).toBeVisible();

  const disabled = component.getByRole('radiogroup', { name: 'Disabled', exact: true });

  for (const radio of await disabled.getByRole('radio').all()) {
    await expect(radio).toBeDisabled();
  }
});

test('radio values distinguish numbers from strings without coercion', async ({ mount }) => {
  const component = await mount(story, { values: 'mixed' });

  await expectSelection(component, 0);
  await component.getByRole('radiogroup', { name: 'Values', exact: true }).getByRole('radio').nth(1).click();
  await expectSelection(component, 1);
  await expect(component.getByTestId('value-model')).toHaveAttribute('data-received-index', '1');
  await expect(component.getByTestId('value-model')).toHaveAttribute('data-updates', '1');
});

test('raw objects match a ref model without conflating equal copies across model and collection changes', async ({ mount }) => {
  const component = await mount(story, { values: 'objects' });
  const radios = component.getByRole('radiogroup', { name: 'Values', exact: true }).getByRole('radio');
  const model = component.getByTestId('value-model');

  await expectSelection(component, 0);
  await radios.nth(1).click();
  await expectSelection(component, 1);
  await expect(model).toHaveAttribute('data-received-index', '1');
  await radios.nth(1).press('ArrowLeft');
  await expectSelection(component, 0);
  await expect(model).toHaveAttribute('data-received-index', '0');

  await component.update({ values: 'objects', operation: 'clone-model' });
  await expectSelection(component, -1);
  await component.update({ values: 'objects', operation: 'select-first' });
  await expectSelection(component, 0);
  await component.update({ values: 'objects', operation: 'replace-items' });
  await expectSelection(component, -1);
  await component.update({ values: 'objects', operation: 'select-last-async' });
  await expectSelection(component, 1);
  await expect(model).toHaveAttribute('data-updates', '2');
});

for (const response of ['reject', 'clone'] as const) {
  test(`radio selection follows the final model when the parent responds with ${response}`, async ({ mount }) => {
    const component = await mount(story, { values: 'objects', response });

    await component.getByRole('radiogroup', { name: 'Values', exact: true }).getByRole('radio').nth(1).click();
    await expectSelection(component, response === 'reject' ? 0 : -1);
    await expect(component.getByTestId('value-model')).toHaveAttribute('data-received-index', '1');
    await expect(component.getByTestId('value-model')).toHaveAttribute('data-updates', '1');
    await expect(component.getByRole('radiogroup', { name: 'Column', exact: true }).getByRole('radio').nth(1)).toBeChecked();

    await component.update({ values: 'objects', response, operation: 'select-last-async' });
    await expectSelection(component, 1);
  });
}

test('pending synchronization uses the current collection after reordering and rapid changes', async ({ mount }) => {
  const component = await mount(story, { values: 'objects', response: 'reverse' });
  const radios = component.getByRole('radiogroup', { name: 'Values', exact: true }).getByRole('radio');

  await radios.nth(1).click();
  await expectSelection(component, 0);

  await radios.evaluateAll((inputs) => {
    (inputs[1] as HTMLInputElement).click();
    (inputs[0] as HTMLInputElement).click();
  });

  await expectSelection(component, 0);
  await expect(component.getByTestId('value-model')).toHaveAttribute('data-updates', '3');
});

test('unmount during change leaves the other groups intact', async ({ mount, page }) => {
  const errors: Array<string> = [];

  page.on('pageerror', (error) => errors.push(error.message));

  const component = await mount(story, { values: 'objects', response: 'unmount' });
  const group = component.getByRole('radiogroup', { name: 'Values', exact: true });

  await group.getByRole('radio').nth(1).click();
  await expect(group).toHaveCount(0);
  await expect(component.getByTestId('value-model')).toHaveAttribute('data-updates', '1');
  await expect(component.getByRole('radiogroup', { name: 'Column', exact: true }).getByRole('radio').nth(1)).toBeChecked();
  expect(errors).toEqual([]);
});
