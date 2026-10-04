import { expect, test } from '~/tests/playwright/fixtures';

const selectStoryId = 'forms/components/DrSelect/DrSelectGallery';

for (const { width, selectionKey } of [
  { width: 390, selectionKey: 'Enter' },
  { width: 560, selectionKey: 'Space' },
]) {
  test(`mobile Select at ${width}px preserves the Tab loop and keyboard selection`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });

    const component = await mount(selectStoryId);
    const trigger = component.getByRole('combobox', { name: 'City', exact: true });
    const dialog = page.getByRole('dialog', { name: 'City', exact: true });
    const listbox = dialog.getByRole('listbox', { name: 'City', exact: true });
    const close = dialog.getByRole('button', { name: 'Закрыть', exact: true });

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(listbox).toBeFocused();

    for (let cycle = 0; cycle < 2; cycle += 1) {
      await page.keyboard.press('Shift+Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(listbox).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(listbox).toBeFocused();
    }

    for (const { key, option } of [
      { key: 'End', option: 'New York' },
      { key: 'Home', option: 'London' },
      { key: 'ArrowDown', option: 'Paris' },
      { key: 'ArrowUp', option: 'London' },
      { key: 'ArrowDown', option: 'Paris' },
    ]) {
      await page.keyboard.press(key);

      await expect(listbox).toHaveAttribute(
        'aria-activedescendant',
        await listbox.getByRole('option', { name: option, exact: true }).getAttribute('id') ?? '',
      );

      await expect(listbox).toBeFocused();
    }

    await page.keyboard.press(selectionKey);
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText('Paris');
    await expect(component.getByText('Selected city: Paris', { exact: true })).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(listbox).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveText('Paris');
  });
}

test('desktop Select at 561px keeps focus on the trigger and closes on Tab', async ({ mount, page }) => {
  await page.setViewportSize({ width: 561, height: 844 });

  const component = await mount(selectStoryId);
  const trigger = component.getByRole('combobox', { name: 'City', exact: true });
  const nextTrigger = component.getByRole('combobox', { name: 'Error', exact: true });
  const listbox = component.getByRole('listbox', { name: 'City', exact: true });

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.keyboard.press('ArrowDown');

  await expect(trigger).toHaveAttribute(
    'aria-activedescendant',
    await listbox.getByRole('option', { name: 'Paris', exact: true }).getAttribute('id') ?? '',
  );

  await expect(trigger).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(listbox).toHaveCount(0);
  await expect(nextTrigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(component.getByText('Selected city: none', { exact: true })).toBeVisible();
});
