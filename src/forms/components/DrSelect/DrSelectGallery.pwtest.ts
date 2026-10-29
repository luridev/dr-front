import { expect, test } from '~/tests/playwright/fixtures';
import type { Locator } from '@playwright/test';

const selectStoryId = 'forms/components/DrSelect/DrSelectGallery';

async function expectValueSelection(trigger: Locator, list: Locator, index: number) {
  const expected = [index === 0, index === 1];

  await expect(trigger.getByTestId('value-slot')).toHaveAttribute('data-index', String(index));

  await expect.poll(async () => ({
    options: await list.getByRole('option').evaluateAll((options) => options.map((option) => option.getAttribute('aria-selected') === 'true')),
    slots: await list.getByTestId('value-slot').evaluateAll((slots) => slots.map((slot) => slot.getAttribute('data-selected') === 'true')),
  })).toEqual({ options: expected, slots: expected });
}

async function expectValueActive(list: Locator, focus: Locator, index: number) {
  await expect(focus).toHaveAttribute('aria-activedescendant', await list.getByRole('option').nth(index).getAttribute('id') ?? '');
  await expect(list.getByTestId('value-slot').nth(index)).toHaveAttribute('data-active', 'true');
}

for (const [mode, width] of [['desktop', 561], ['mobile', 560]] as const) {
  test(`${mode} Select follows a rejected or transformed parent model when reopened`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });
    const component = await mount(selectStoryId, { values: 'objects', response: 'reject' });
    const trigger = component.getByRole('combobox', { name: 'Values', exact: true, includeHidden: true });
    const list = page.getByRole('listbox', { name: 'Values', exact: true });
    const focus = mode === 'mobile' ? list : trigger;
    const model = component.getByTestId('value-model');

    for (const [response, expectedIndex, updates] of [['reject', 0, '1'], ['clone', -1, '2']] as const) {
      await component.update({ values: 'objects', response });
      await trigger.press('Enter');
      await expectValueSelection(trigger, list, 0);
      await list.getByRole('option').nth(1).click();
      await expect(list).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(model).toHaveAttribute('data-received-index', '1');
      await expect(model).toHaveAttribute('data-updates', updates);
      await expect(model).toHaveAttribute('data-selected-index', String(expectedIndex));
      await expect(trigger.getByTestId('value-slot')).toHaveAttribute('data-index', String(expectedIndex));

      await trigger.press('Enter');
      await expect(focus).toBeFocused();
      await expectValueSelection(trigger, list, expectedIndex);
      await expectValueActive(list, focus, 0);
      await expect(model).toHaveAttribute('data-updates', updates);
      await page.keyboard.press('Escape');
      await expect(list).toHaveCount(0);
    }

    await component.update({ values: 'objects', operation: 'select-last' });
    await trigger.press('Enter');
    await expectValueSelection(trigger, list, 1);
    await expectValueActive(list, focus, 1);
    await expect(model).toHaveAttribute('data-updates', '2');
  });

  test(`${mode} Select matches a ref model to raw objects across selection and external updates`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });
    const component = await mount(selectStoryId, { values: 'objects' });
    const trigger = component.getByRole('combobox', { name: 'Values', exact: true, includeHidden: true });
    const list = page.getByRole('listbox', { name: 'Values', exact: true });
    const focus = mode === 'mobile' ? list : trigger;
    const model = component.getByTestId('value-model');

    await trigger.press('Enter');
    await expect(focus).toBeFocused();
    await expectValueSelection(trigger, list, 0);
    await expectValueActive(list, focus, 0);
    await list.getByRole('option').nth(1).click();
    await expect(list).toHaveCount(0);
    await expect(trigger.getByTestId('value-slot')).toHaveAttribute('data-index', '1');
    await expect(trigger.getByTestId('value-slot')).toHaveAttribute('data-selected', 'true');
    await expect(model).toHaveAttribute('data-selected-index', '1');
    await expect(model).toHaveAttribute('data-received-index', '1');
    await expect(model).toHaveAttribute('data-updates', '1');

    await trigger.press('Enter');
    await expectValueSelection(trigger, list, 1);
    await expectValueActive(list, focus, 1);
    await page.keyboard.press('ArrowUp');
    await expectValueActive(list, focus, 0);
    await expectValueSelection(trigger, list, 1);
    await page.keyboard.press('Enter');
    await expect(list).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger.getByTestId('value-slot')).toHaveAttribute('data-index', '0');
    await expect(model).toHaveAttribute('data-received-index', '0');
    await expect(model).toHaveAttribute('data-updates', '2');

    await trigger.press('Enter');
    await component.update({ values: 'objects', operation: 'select-last' });
    await expectValueSelection(trigger, list, 1);
    await expectValueActive(list, focus, 1);
    await component.update({ values: 'objects', operation: 'clone-model' });
    await expectValueSelection(trigger, list, -1);
    await component.update({ values: 'objects', operation: 'select-first' });
    await expectValueSelection(trigger, list, 0);
    await component.update({ values: 'objects', operation: 'replace-items' });
    await expectValueSelection(trigger, list, -1);
    await expect(model).toHaveAttribute('data-updates', '2');
    await list.getByRole('option').nth(1).click();
    await expect(trigger.getByTestId('value-slot')).toHaveAttribute('data-index', '1');
    await expect(model).toHaveAttribute('data-selected-index', '1');
    await expect(model).toHaveAttribute('data-received-index', '1');
    await expect(model).toHaveAttribute('data-updates', '3');
  });
}

test('Select keeps numeric and string values distinct', async ({ mount, page }) => {
  await page.setViewportSize({ width: 900, height: 844 });
  const component = await mount(selectStoryId, { values: 'mixed' });
  const trigger = component.getByRole('combobox', { name: 'Values', exact: true });
  const list = page.getByRole('listbox', { name: 'Values', exact: true });

  await trigger.press('Enter');
  await expectValueSelection(trigger, list, 0);
  await list.getByRole('option').nth(1).click();
  await trigger.press('Enter');
  await expectValueSelection(trigger, list, 1);
  await expect(component.getByTestId('value-model')).toHaveAttribute('data-received-index', '1');
});

test('mobile Select at 560px focuses its listbox and returns the keyboard selection', async ({ mount, page }) => {
  await page.setViewportSize({ width: 560, height: 844 });
  const component = await mount(selectStoryId);
  const trigger = component.getByRole('combobox', { name: 'City', exact: true });
  const dialog = page.getByRole('dialog', { name: 'City', exact: true });
  const listbox = dialog.getByRole('listbox');
  await trigger.press('Enter');
  await expect(listbox).toBeFocused();
  await expect(listbox).toHaveAccessibleName('City');
  await dialog.getByRole('heading', { name: 'City', exact: true }).click();
  await page.locator('.DrOverlayLayer_top').click({ position: { x: 5, y: 5 } });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await listbox.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(listbox).toBeFocused();
  await page.keyboard.press('ArrowDown');

  await expect(listbox).toHaveAttribute(
    'aria-activedescendant',
    await listbox.getByRole('option', { name: 'Paris', exact: true }).getAttribute('id') ?? '',
  );

  await page.keyboard.press('Space');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Paris');
  await expect(component.getByText('Selected city: Paris', { exact: true })).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('desktop Select keeps focus at 561px and follows external model changes', async ({ mount, page }) => {
  await page.setViewportSize({ width: 561, height: 844 });

  const component = await mount(selectStoryId);
  const trigger = component.getByRole('combobox', { name: 'City', exact: true });
  const listbox = page.getByRole('listbox', { name: 'City', exact: true });

  await trigger.press('Enter');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.keyboard.press('ArrowDown');

  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    await listbox.getByRole('option', { name: 'Paris', exact: true }).getAttribute('id') ?? '',
  );

  await expect(trigger).toBeFocused();
  await expect(component.getByText('Selected city: none', { exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(listbox).toHaveCount(0);
  await expect(trigger).toHaveText('Paris');
  await trigger.press('Space');
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Paris');
  await trigger.click();
  const reset = component.getByRole('button', { name: 'Reset city' });

  await reset.evaluate((button: HTMLButtonElement) => {
    button.click();
  });

  await expect(listbox).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText('Choose a city');
  await expect(listbox.getByRole('option', { selected: true })).toHaveCount(0);

  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    await listbox.getByRole('option').first().getAttribute('id') ?? '',
  );

  await reset.click();
  await expect(listbox).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls');
  await expect(trigger).not.toHaveAttribute('aria-activedescendant');
  const error = component.getByRole('combobox', { name: 'Error', exact: true });
  await expect(error).toHaveAttribute('aria-invalid', 'true');
  await expect(error).toHaveAccessibleDescription('Choose a delivery city.');
});

for (const width of [560, 561]) {
  test(`Select shares slot and fallback names across its trigger and popup at ${width}px`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });
    const component = await mount(selectStoryId, { label: 'Ignored prop label', slotLabel: 'Delivery city' });
    const trigger = component.getByRole('combobox', { name: 'Delivery city', exact: true });
    await trigger.press('Enter');

    for (const label of ['Delivery city', 'Updated delivery city']) {
      await component.update({ label: 'Ignored prop label', slotLabel: label });
      const listbox = page.getByRole('listbox', { name: label, exact: true });
      await expect(listbox).toBeVisible();

      if (width === 560) {
        const dialog = page.getByRole('dialog', { name: label, exact: true });
        await expect(dialog.getByTestId('city-label')).toBeVisible();
      }
    }

    await expect(page.getByTestId('city-label')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(component.getByRole('combobox', { name: 'Updated delivery city', exact: true })).toBeFocused();

    for (const placeholder of ['Choose a city', '']) {
      await component.update({ label: '', placeholder });
      const fallback = placeholder !== '' ? placeholder : 'Select an option';
      const fallbackTrigger = component.getByRole('combobox', { name: fallback, exact: true });
      await fallbackTrigger.press('Enter');
      await expect(page.getByRole('listbox', { name: fallback, exact: true })).toBeVisible();

      if (width === 560) {
        await expect(page.getByRole('dialog', { name: fallback, exact: true })).toBeVisible();
      }

      await page.keyboard.press('Escape');
      await expect(fallbackTrigger).toBeFocused();
    }
  });
}
