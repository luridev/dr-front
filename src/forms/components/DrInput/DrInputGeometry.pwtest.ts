import { expect, test } from '~/tests/playwright/fixtures';
import type { Locator } from '@playwright/test';

function getInputActions(root: Locator): Locator {
  return root.locator([
    '.DrInput__clearButton',
    '.DrInputNumber__signButton',
    '.DrInputNumber__stepperButton',
    '.DrInputTime__periodButton',
  ].join(', '));
}

test('number actions, clear and AM/PM retain their distinct keyboard focus behavior', async ({ mount, page }) => {
  const root = await mount('configuration/components/DrFrontProvider/FocusShowcase/FocusShowcase');
  const number = root.getByRole('spinbutton', { name: 'Number', exact: true });
  await number.press('Shift');

  for (const name of ['Change sign of Number', 'Increase Number', 'Decrease Number']) {
    const action = root.getByRole('button', { name, exact: true });
    await expect(action).toHaveAttribute('tabindex', '-1');
    await action.click();
    await expect(number).toBeFocused();
  }

  await page.keyboard.press('Tab');
  const clear = root.getByRole('button', { name: 'Clear Number', exact: true });
  await expect(clear).toBeFocused();
  await expect(clear).toHaveCSS('outline-offset', '-4px');
  await page.keyboard.press('Tab');
  await expect(root.getByRole('textbox', { name: 'Date', exact: true })).toBeFocused();
  await clear.press('Enter');
  await expect(number).toBeFocused();

  await root.getByRole('textbox', { name: 'Time', exact: true }).press('Shift');
  await page.keyboard.press('Tab');
  await expect(root.getByRole('button', { name: 'Clear Time', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  const period = root.getByRole('button', { name: 'Switch Time to PM', exact: true });
  await expect(period).toBeFocused();
  await expect(period).toHaveCSS('outline-offset', '-4px');
  await page.keyboard.press('Enter');
  await expect(root.getByRole('button', { name: 'Switch Time to AM', exact: true })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(period).toBeFocused();
});

for (const kind of ['Number', 'Time'] as const) {
  test(`${kind} keeps nested actions square within the rounded field`, async ({ mount, page }, testInfo) => {
    const root = await mount(`forms/components/DrInput${kind}/DrInput${kind}Gallery`);
    const grid = root.locator('.GalleryExample__grid');

    const input = kind === 'Number'
      ? page.getByRole('spinbutton', { name: 'Optional', exact: true })
      : page.getByRole('textbox', { name: 'Minutes', exact: true });

    const surface = root.locator('[data-dr-focus-surface]').filter({ has: input });

    const action = kind === 'Number'
      ? surface.getByRole('button', { name: 'Change sign of Optional', exact: true })
      : surface.getByRole('button', { name: 'Switch Minutes to AM', exact: true });

    const buttons = getInputActions(root);

    await expect(buttons.first()).toBeVisible();

    for (const button of await buttons.all()) {
      await expect(button).toHaveCSS('border-radius', '0px');
    }

    const radius = await surface.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderRadius));

    expect(radius).toBeGreaterThan(0);
    await expect(surface).toHaveCSS('overflow', 'hidden');
    await page.evaluate(() => document.fonts.ready);
    await testInfo.attach('fields', { body: await grid.screenshot({ animations: 'disabled' }), contentType: 'image/png' });

    const border = await surface.evaluate((element) => getComputedStyle(element).borderColor);
    await action.hover();
    await expect(action).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await testInfo.attach('hover', { body: await surface.screenshot({ animations: 'disabled' }), contentType: 'image/png' });
    await action.hover();
    await page.mouse.down();

    try {
      const active = await action.evaluate((element) => element.matches(':active:not(:focus-visible)'));

      await expect(action).toHaveCSS('opacity', active ? '0.65' : '1');
      await expect(action).toHaveCSS('border-radius', '0px');
      await testInfo.attach('pressed', { body: await surface.screenshot(), contentType: 'image/png' });
    } finally {
      await page.mouse.up();
    }

    await input.press('ArrowLeft');
    await expect(surface).toHaveCSS('outline-style', 'solid');
    await expect(surface).toHaveCSS('border-color', border);
    const clear = surface.locator('.DrInput__clearButton');
    await clear.press('Shift');
    await expect(clear).toHaveCSS('outline-style', 'solid');
    await expect(clear).toHaveCSS('outline-offset', '-4px');
    await expect(clear).toHaveCSS('border-radius', '0px');
    await testInfo.attach('nested-action-focus', { body: await surface.screenshot(), contentType: 'image/png' });

    const disabledInput = kind === 'Number'
      ? page.getByRole('spinbutton', { name: 'Disabled', exact: true })
      : page.getByRole('textbox', { name: 'Disabled', exact: true });

    const disabledSurface = root.locator('[data-dr-focus-surface]').filter({ has: disabledInput });

    for (const button of await getInputActions(disabledSurface).all()) {
      await expect(button).toBeDisabled();
      await expect(button).toHaveCSS('border-radius', '0px');
    }
  });
}

test('standalone icon buttons retain their radius outside the input action selection', async ({ mount }) => {
  const root = await mount('configuration/components/DrFrontProvider/FocusShowcase/FocusShowcase');
  const standalone = root.getByRole('button', { name: 'Save with icon', exact: true });
  const inputActions = getInputActions(root);

  await expect(standalone).toBeVisible();
  await expect(inputActions.first()).toBeVisible();
  await expect(inputActions.and(standalone)).toHaveCount(0);
  const radius = await standalone.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderRadius));

  expect(radius).toBeGreaterThan(0);
});
