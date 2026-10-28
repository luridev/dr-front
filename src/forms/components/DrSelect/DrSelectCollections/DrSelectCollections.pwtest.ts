import { expect, test } from '~/tests/playwright/fixtures';
import type { Locator } from '@playwright/test';
import type { SelectCollectionOperation } from '@/forms/components/DrSelect/DrSelectCollections/types.support';

const story = 'forms/components/DrSelect/DrSelectCollections/DrSelectCollections';

async function expectActiveVisible(list: Locator, focus: Locator, name: string) {
  const option = list.getByRole('option', { name, exact: true });
  await expect(focus).toHaveAttribute('aria-activedescendant', await option.getAttribute('id') ?? '');

  await expect.poll(() => option.evaluate((element) => {
    const listbox = element.closest<HTMLElement>('[role="listbox"]');

    if (listbox == null) {
      return false;
    }

    const viewport = listbox.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    const top = viewport.top + listbox.clientTop;

    return bounds.height > 0 && bounds.top >= top - 1 && bounds.bottom <= top + listbox.clientHeight + 1;
  })).toBe(true);
}

for (const [mode, width] of [['desktop', 900], ['mobile', 390]] as const) {
  test(`${mode} collection mutations keep the active option visible and preserve selection by identity`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 320 });
    const root = await mount(story);
    const trigger = root.getByRole('combobox', { name: 'Collection' });
    const list = page.getByRole('listbox', { name: 'Collection' });
    const focus = mode === 'mobile' ? list : trigger;

    await trigger.press('Enter');
    await expect(focus).toBeFocused();
    await page.keyboard.press('End');
    await expectActiveVisible(list, focus, 'Option 40');

    const operations: Array<[SelectCollectionOperation, string]> = [
      ['reverse', 'Option 1'],
      ['splice', 'Option 1'],
      ['replace', 'Option 21'],
      ['add', 'Option 22'],
    ];

    for (const [operation, activeName] of operations) {
      await list.evaluate((element) => {
        element.scrollTop = 0;
      });

      await root.update({ operation });
      await expectActiveVisible(list, focus, activeName);
    }

    await expect(list.getByRole('option', { selected: true })).toHaveText('Option 20');
    await expect(root.getByTestId('selection')).toHaveText('Option 20');
    await page.keyboard.press('ArrowUp');
    await expectActiveVisible(list, focus, 'Option 23');
    await page.keyboard.press('Enter');
    await expect(list).toHaveCount(0);
    await expect(root.getByTestId('selection')).toHaveText('Option 23');
    await expect(trigger).toBeFocused();
  });
}
