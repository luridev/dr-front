import { expect, test } from '~/tests/playwright/fixtures';

const story = 'forms/components/DrSelect/DrSelectPopup';

test('viewport placement and local scrolling preserve object selection through a clipped parent', async ({ mount, page }) => {
  await page.setViewportSize({ width: 900, height: 300 });
  const root = await mount(story);
  const frame = root.getByTestId('scroll-frame');
  const trigger = root.getByRole('combobox', { name: 'Choice' });

  await frame.evaluate((element) => {
    Object.assign(element.style, {
      position: 'fixed',
      bottom: '8px',
      right: '-40px',
      height: '100px',
      overflow: 'auto',
      transform: 'translateZ(0)',
    });

    const spacer = document.createElement('div');
    spacer.style.height = '400px';
    element.append(spacer);
  });

  await trigger.click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(root.getByRole('listbox')).toHaveCount(0);
  const popup = await list.boundingBox();
  const anchor = await trigger.boundingBox();
  expect(popup).not.toBeNull();
  expect(anchor).not.toBeNull();
  expect((popup?.y ?? Infinity) + (popup?.height ?? 0)).toBeLessThan(anchor?.y ?? 0);
  await expect(list).toBeInViewport({ ratio: 1 });
  await expect(list.getByRole('option').last()).toBeInViewport({ ratio: 1 });
  const scroll = await frame.evaluate((element) => [element.scrollTop, scrollY]);

  for (const [key, name] of [['Home', 'Option 1'], ['ArrowDown', 'Option 2'], ['End', 'Option 40']]) {
    await trigger.press(key);
    await expect(list.getByRole('option', { name, exact: true })).toBeInViewport({ ratio: 1 });
  }

  expect(await frame.evaluate((element) => [element.scrollTop, scrollY])).toEqual(scroll);
  await trigger.press('Home');
  await trigger.press('ArrowDown');
  await list.getByRole('option', { name: 'Option 2', exact: true }).click();
  await expect(root.getByTestId('selection')).toHaveText('1');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(list.getByRole('option', { name: 'Option 2', exact: true })).toHaveAttribute('aria-selected', 'true');

  const hiddenScroll = await frame.evaluate((element) => {
    element.scrollTop = element.scrollHeight;

    return [element.scrollTop, scrollY];
  });

  await expect(list).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-activedescendant');
  expect(await frame.evaluate((element) => [element.scrollTop, scrollY])).toEqual(hiddenScroll);
});

test('Tab with a teleported popup follows the trigger in both directions', async ({ mount, page }) => {
  const root = await mount(story);
  const trigger = root.getByRole('combobox');

  for (const [key, name] of [['Tab', 'After select'], ['Shift+Tab', 'Before select']]) {
    await trigger.click();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Home');
    await page.keyboard.press(key);
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(root.getByRole('button', { name, exact: true })).toBeFocused();
    await expect(root.getByTestId('selection')).toHaveText('39');
  }
});

test('disabling or unmounting an open Select removes the popup without taking outside focus', async ({ mount, page }) => {
  const root = await mount(story);
  const trigger = root.getByRole('combobox');
  const list = page.getByRole('listbox');
  await trigger.click();
  await root.update({ disabled: true });
  await expect(trigger).toBeDisabled();
  await expect(list).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls');
  await root.update({ disabled: false });
  await trigger.click();
  const outside = root.getByRole('button', { name: 'After select' });
  await outside.focus();
  await expect(list).toHaveCount(0);
  await expect(outside).toBeFocused();
  await trigger.click();
  await expect(list).toBeVisible();
  await root.unmount();
  await expect(list).toHaveCount(0);
  await root.update();
  await trigger.press('Enter');
  await expect(list).toBeVisible();
  await expect(trigger).toBeFocused();
});

test('popup Tab at either document boundary preserves native navigation without wrapping', async ({ mount, page }) => {
  const root = await mount(story);
  const trigger = root.getByRole('combobox');

  for (const [key, props] of [
    ['Tab', { before: true, after: false }],
    ['Shift+Tab', { before: false, after: true }],
  ] as const) {
    await root.update(props);
    await trigger.focus();
    await page.keyboard.press(key);

    const nativeTarget = await page.evaluate(() => document.activeElement === document.body
      ? 'body'
      : document.activeElement?.textContent.trim());

    await trigger.click();
    await expect(trigger).toBeFocused();
    await page.keyboard.press(key);
    await expect(page.getByRole('listbox')).toHaveCount(0);

    const popupTarget = await page.evaluate(() => document.activeElement === document.body
      ? 'body'
      : document.activeElement?.textContent.trim());

    expect(popupTarget).toBe(nativeTarget);
  }
});
