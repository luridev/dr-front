import { expect, test } from '~/tests/playwright/fixtures';

test.describe('DrTabSwitcher', () => {
  test('arrow keys skip holes and keep the active tab focused', async ({ mount }) => {
    const component = await mount('navigation/tabs/components/DrTabSwitcher/DrTabsGallery', { sparse: true });
    const tabs = component.getByRole('tablist', { name: 'Project sections' });
    const overview = tabs.getByRole('tab', { name: 'Overview' });
    const settings = tabs.getByRole('tab', { name: 'Settings' });
    const history = tabs.getByRole('tab', { name: 'History' });

    await expect(tabs.getByRole('tab')).toHaveText(['Overview', 'Settings', 'History']);
    await overview.press('ArrowRight');
    await expect(settings).toHaveAttribute('aria-selected', 'true');
    await expect(settings).toBeFocused();
    await settings.press('End');
    await expect(history).toBeFocused();
    await history.press('ArrowRight');
    await expect(overview).toBeFocused();
    await expect(overview).toHaveAttribute('tabindex', '0');
  });

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
});
