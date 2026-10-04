import { expect, test } from '~/tests/playwright/fixtures';

test('keyboard navigation focuses the selected tab after keyed items are reordered', async ({ mount, page }) => {
  const component = await mount('navigation/tabs/components/DrTabSwitcher/DrTabsGallery');
  const tabs = component.getByRole('tablist', { name: 'Project sections' });
  const overview = tabs.getByRole('tab', { name: 'Overview', exact: true });

  await component.getByRole('checkbox', { name: 'Reverse order', exact: true }).check();
  await expect(tabs.getByRole('tab')).toHaveText(['History', 'Settings', 'Overview']);
  await tabs.getByRole('tab', { name: 'Settings', exact: true }).click();
  await page.keyboard.press('ArrowRight');

  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await expect(overview).toBeFocused();
});
