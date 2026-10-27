import { expect, test } from '~/tests/playwright/fixtures';

test('nested surfaces own their targets while unpaired elements keep global focus', async ({ mount, page }) => {
  const root = await mount('configuration/components/DrFrontProvider/FocusShowcase/FocusNesting');
  const draft = page.getByRole('textbox', { name: 'Draft', exact: true });
  const tag = page.getByRole('textbox', { name: 'Tag', exact: true });
  const draftSurface = root.locator('[data-dr-focus-surface]').filter({ has: draft });
  const tagSurface = root.locator('[data-dr-focus-surface]').filter({ has: tag }).last();

  await page.keyboard.press('Tab');
  await expect(draftSurface).toHaveCSS('outline-style', 'solid');
  await expect(draft).toHaveCSS('outline-style', 'none');

  await page.keyboard.press('Tab');
  await expect(tag).toBeFocused();
  await expect(tagSurface).toHaveCSS('outline-style', 'solid');
  await expect(draftSurface).toHaveCSS('outline-style', 'none');

  const action = page.getByRole('button', { name: 'Native action inside a surface', exact: true });
  await action.press('Shift');
  await expect(action).toHaveCSS('outline-style', 'solid');
  await expect(root.locator('[data-dr-focus-surface]').filter({ has: action })).toHaveCSS('outline-style', 'none');

  await page.keyboard.press('Tab');
  const standalone = page.getByRole('textbox', { name: 'Standalone target', exact: true });
  await expect(standalone).toBeFocused();
  await expect(standalone).toHaveCSS('outline-style', 'solid');
});

test('invalid editor and clear action have separate indicators and preserve the error border', async ({ mount, page }) => {
  const root = await mount('configuration/components/DrFrontProvider/FocusShowcase/FocusShowcase');
  const input = page.getByRole('textbox', { name: 'Invalid input', exact: true });
  const surface = root.locator('[data-dr-focus-surface]').filter({ has: input });
  const clear = root.getByRole('button', { name: 'Clear Invalid input', exact: true });
  const border = await surface.evaluate((element) => getComputedStyle(element).borderColor);

  await input.press('ArrowLeft');
  await expect(surface).toHaveCSS('outline-style', 'solid');
  await expect(input).toHaveCSS('outline-style', 'none');
  await expect(surface).toHaveCSS('border-color', border);

  await page.keyboard.press('Tab');
  await expect(clear).toBeFocused();
  await expect(clear).toHaveCSS('outline-style', 'solid');
  await expect(clear).toHaveCSS('outline-offset', '-4px');
  await expect(surface).toHaveCSS('outline-style', 'none');
});
