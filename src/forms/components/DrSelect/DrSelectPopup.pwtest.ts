import { expect, test } from '~/tests/playwright/fixtures';

const story = 'forms/components/DrSelect/DrSelectPopup';

test('desktop virtual focus remains visible in forced colors while DOM focus stays on the trigger', async ({ mount, page }) => {
  await page.setViewportSize({ width: 900, height: 844 });
  await page.emulateMedia({ forcedColors: 'active' });
  const root = await mount(story);
  const trigger = root.getByRole('combobox', { name: 'Choice' });

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');

  const list = page.getByRole('listbox');
  const active = list.getByRole('option', { name: 'Option 2', exact: true });

  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-activedescendant', await active.getAttribute('id') ?? '');
  await expect(active).toHaveCSS('outline-style', 'solid');
  await expect(list).toHaveCSS('outline-style', 'none');
  await expect(list.getByRole('option', { name: 'Option 1', exact: true })).toHaveCSS('outline-style', 'none');
});

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
  const shell = page.locator('.DrSelect__popup');
  await expect(list).toBeVisible();
  await expect(root.getByRole('listbox')).toHaveCount(0);
  const popup = await shell.boundingBox();
  const anchor = await trigger.boundingBox();
  expect(popup).not.toBeNull();
  expect(anchor).not.toBeNull();
  expect((popup?.y ?? Infinity) + (popup?.height ?? 0)).toBeLessThan(anchor?.y ?? 0);
  await expect(shell).toBeInViewport({ ratio: 1 });
  expect(await shell.evaluate((element) => element.scrollHeight === element.clientHeight)).toBe(true);
  expect(await list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
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

for (const theme of ['light', 'dark']) {
  test(`mobile keyboard focus follows the active option independently of selection in ${theme} theme`, async ({ mount, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const root = await mount(story);

    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);

    const trigger = root.getByRole('combobox', { name: 'Choice' });
    await trigger.press('Enter');
    const list = page.getByRole('listbox');
    const selected = list.getByRole('option', { selected: true });
    await expect(list).toBeFocused();
    await expect(list).toHaveCSS('border-top-width', '0px');
    await expect(list).toHaveCSS('border-radius', '0px');
    await expect(list).toHaveCSS('box-shadow', 'none');
    await expect(selected).toHaveCSS('outline-style', 'solid');
    const selectedId = await selected.getAttribute('id');

    for (const [key, name] of [['ArrowUp', 'Option 39'], ['Home', 'Option 1'], ['ArrowDown', 'Option 2'], ['End', 'Option 40']]) {
      await list.press(key);
      const active = list.getByRole('option', { name, exact: true });
      await expect(list).toHaveAttribute('aria-activedescendant', await active.getAttribute('id') ?? '');
      await expect(active).toHaveCSS('outline-style', 'solid');
      await expect(active).toBeInViewport({ ratio: 1 });
      await expect(selected).toHaveAttribute('id', selectedId ?? '');

      const indicator = await active.evaluate((element) => {
        const style = getComputedStyle(element);

        return { width: parseFloat(style.outlineWidth), offset: parseFloat(style.outlineOffset) };
      });

      expect(indicator.width).toBeGreaterThan(0);
      expect(indicator.offset).toBeLessThanOrEqual(-indicator.width);

      if (name !== 'Option 40') {
        await expect(selected).toHaveCSS('outline-style', 'none');
      }
    }

    await page.emulateMedia({ forcedColors: 'active' });
    await expect(selected).toHaveCSS('outline-style', 'solid');

    expect(await selected.evaluate((element) => {
      const style = getComputedStyle(element);

      return style.outlineColor !== style.backgroundColor;
    })).toBe(true);

    await list.press('Home');
    await list.press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(root.getByTestId('selection')).toHaveText('0');
    await expect(trigger).toBeFocused();
  });
}

for (const [mode, width, action] of [
  ['desktop touch', 900, 'tap'],
  ['mobile touch', 390, 'tap'],
  ['mobile mouse', 390, 'click'],
] as const) {
  test.describe(mode, () => {
    test.use({ hasTouch: action === 'tap' });

    test('selects an option without transferring DOM focus or showing a keyboard outline', async ({ mount, page }) => {
      await page.setViewportSize({ width, height: 844 });
      const root = await mount(story);
      const trigger = root.getByRole('combobox', { name: 'Choice' });
      const list = page.getByRole('listbox');

      const optionFocus = await page.evaluateHandle(() => {
        const state = { occurred: false };

        document.addEventListener('focusin', (event) => {
          if (event.target instanceof Element && event.target.closest('[role="option"]') != null) {
            state.occurred = true;
          }
        });

        return state;
      });

      await trigger[action]();
      await expect(width === 390 ? list : trigger).toBeFocused();
      await expect(list.getByRole('option', { selected: true })).toHaveCSS('outline-style', 'none');
      await list.getByRole('option', { name: 'Option 39', exact: true })[action]();
      await expect(root.getByTestId('selection')).toHaveText('38');
      await expect(width === 390 ? page.getByRole('dialog') : list).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await optionFocus.evaluate((state) => state.occurred)).toBe(false);
      await optionFocus.dispose();
    });
  });
}

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
