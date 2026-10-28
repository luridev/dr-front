import { keepAliveStoryId, lifecycleStoryId } from '@/forms/components/DrSelect/DrSelectLifecycle/config.support';
import { expect, test } from '~/tests/playwright/fixtures';

for (const width of [390, 1280]) {
  test(`consumer providers, reactive slots and component state survive list updates at ${width}px`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });

    const root = await mount(lifecycleStoryId);
    const trigger = root.getByRole('combobox', { name: 'Context select', includeHidden: true });
    const list = page.getByRole('listbox', { name: 'Context select' });
    const first = list.getByRole('option').nth(0).getByTestId('slot-content');
    const second = list.getByRole('option').nth(1).getByTestId('slot-content');

    await expect(trigger).toHaveText('first:Alpha:provided:initial');
    await root.update({ visible: false });
    await expect(trigger).toBeHidden();
    await root.update({ visible: true });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(first).toHaveText('first:Alpha:provided:initial');
    await expect(first).toHaveAttribute('data-index', '0');
    await expect(first).toHaveAttribute('data-selected', 'true');
    await expect(first).toHaveAttribute('data-active', 'true');

    if (width === 390) {
      await expect(page.getByRole('dialog').getByRole('button', { name: 'Закрыть', exact: true })).toBeVisible();
    }

    await root.update({ contextValue: 'updated', suffix: 'changed', language: 'en' });
    await expect(first).toHaveText('first:Alpha:updated:changed');
    await expect(first).toHaveAttribute('data-local-changes', '1');

    if (width === 390) {
      await expect(page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    }

    await page.keyboard.press('ArrowDown');
    await expect(second).toHaveAttribute('data-index', '1');
    await expect(second).toHaveAttribute('data-active', 'true');
    await expect(first).toHaveAttribute('data-active', 'false');

    await root.update({ contextValue: 'latest', suffix: 'changed', selectedIndex: 1, language: 'en' });
    await expect(second).toHaveText('first:Beta:latest:changed');
    await expect(second).toHaveAttribute('data-selected', 'true');
    await expect(first).toHaveAttribute('data-selected', 'false');
    await expect(first).toHaveAttribute('data-local-changes', '1');
    await page.keyboard.press('Escape');
    await expect(list).toHaveCount(0);

    if (width === 390) {
      await trigger.click();
      await expect(first).toHaveAttribute('data-local-changes', '0');
      await page.keyboard.press('Escape');
    }
  });

  test(`item slots appear before opening and can be replaced or removed while open at ${width}px`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });

    const root = await mount(lifecycleStoryId, { slot: 'absent' });
    const trigger = root.getByRole('combobox', { name: 'Context select' });
    const list = page.getByRole('listbox', { name: 'Context select' });
    const first = list.getByRole('option').first();

    await expect(trigger).toHaveText('[object Object]');
    await root.update({ slot: 'first' });
    await expect(trigger).toHaveText('first:Alpha:provided:initial');
    await trigger.click();
    await expect(first).toHaveText('first:Alpha:provided:initial');
    await root.update({ slot: 'second' });
    await expect(first).toHaveText('second:Alpha:provided:initial');
    await expect(trigger).toHaveText('second:Alpha:provided:initial');
    await root.update({ slot: 'absent' });
    await expect(first).toHaveText('[object Object]');
    await expect(trigger).toHaveText('[object Object]');
    await page.keyboard.press('Escape');
  });

  test(`an item slot removed before the first opening uses fallback content at ${width}px`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });

    const root = await mount(lifecycleStoryId, { slot: 'first' });
    const trigger = root.getByRole('combobox', { name: 'Context select' });

    await root.update({ slot: 'absent' });
    await expect(trigger).toHaveText('[object Object]');
    await trigger.click();
    await expect(page.getByRole('listbox').getByRole('option').first()).toHaveText('[object Object]');
    await page.keyboard.press('Escape');
  });

  test(`KeepAlive owner closes its list and can open it again after activation at ${width}px`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height: 844 });

    const root = await mount(keepAliveStoryId);
    const trigger = root.getByRole('combobox', { name: 'Cached select' });
    const list = page.getByRole('listbox', { name: 'Cached select' });
    const background = root.getByTestId('primary-background');

    await trigger.click();
    await list.getByRole('option', { name: 'two', exact: true }).click();
    await trigger.click();
    await expect(list).toBeVisible();
    const detachedTrigger = await trigger.elementHandle();
    await root.update({ active: false });
    await expect(root.getByTestId('deactivations')).toHaveText('1');
    await expect(list).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(background).not.toHaveAttribute('inert');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');

    await detachedTrigger.evaluate((element: HTMLButtonElement) => {
      element.click();
    });

    await expect(list).toHaveCount(0);
    await root.getByRole('button', { name: 'Outside focus' }).focus();
    await expect(root.getByRole('button', { name: 'Outside focus' })).toBeFocused();
    await root.update({ active: true });
    await expect(trigger).toHaveText('two');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(list.getByRole('option', { name: 'two', exact: true })).toHaveAttribute('aria-selected', 'true');
    await root.unmount();
    await expect(list).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await detachedTrigger.dispose();
  });
}

test('deactivating a cached Host closes only its modal and permits a fresh opening after activation', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const root = await mount(keepAliveStoryId, { scope: 'host', secondary: true });
  const primary = root.getByTestId('primary-background');
  const secondary = root.getByTestId('secondary-background');
  const trigger = root.getByRole('combobox', { name: 'Cached select' });
  const firstDialog = page.getByRole('dialog', { name: 'Cached select', includeHidden: true });
  const otherDialog = page.getByRole('dialog', { name: 'Other select' });

  await trigger.click();
  await expect(firstDialog).toBeVisible();

  await root.getByRole('combobox', { name: 'Other select' }).evaluate((element: HTMLButtonElement) => {
    element.click();
  });

  await expect(otherDialog.getByRole('listbox')).toBeFocused();
  await expect(primary).toHaveAttribute('inert');
  await expect(secondary).toHaveAttribute('inert');
  await root.update({ scope: 'host', secondary: true, active: false });
  await expect(root.getByTestId('deactivations')).toHaveText('1');
  await expect(firstDialog).toHaveCount(0);
  await expect(otherDialog).toBeVisible();
  await expect(otherDialog.getByRole('listbox')).toBeFocused();
  await expect(primary).not.toHaveAttribute('inert');
  await expect(secondary).toHaveAttribute('inert');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(otherDialog).toHaveCount(0);
  await expect(secondary).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await root.update({ scope: 'host', secondary: true, active: true });
  await trigger.click();
  await expect(firstDialog).toBeVisible();
  await expect(primary).toHaveAttribute('inert');
  await root.update({ scope: 'host', secondary: true, active: false });
  await root.unmount();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});
