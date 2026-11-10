import { focusRingCases } from '@/actions/components/DrButton/DrButtonFocusRing/config.support';
import { readFieldLayout, readFocusRing } from '@/actions/components/DrButton/DrButtonFocusRing/focusRing.support';
import { expect, test } from '~/tests/playwright/fixtures';

const story = 'actions/components/DrButton/DrButtonFocusRing/DrButtonFocusRing';

test.describe('DrButtonFocusRing', () => {
  test('default outside ring and reactive placement preserve the button, layout and keyboard behavior', async ({ mount, page }) => {
    const root = await mount(story);
    const action = root.getByRole('button', { name: 'Action', exact: true });
    const reference = root.getByRole('button', { name: 'Default reference', exact: true });
    const nativeButton = await action.elementHandle();
    const row = root.getByTestId('switching');

    const layout = () => row.locator('button').evaluateAll((buttons) => buttons.map((button) => {
      const rect = button.getBoundingClientRect();

      return [rect.x, rect.y, rect.width, rect.height];
    }));

    await reference.press('Shift');
    const outside = await readFocusRing(reference);
    expect(outside.style).toBe('solid');
    expect(outside.offset).toBeGreaterThan(0);
    await root.getByRole('button', { name: 'Before', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    expect(await readFocusRing(action)).toEqual(outside);
    await expect(action).not.toHaveAttribute('data-dr-focus-inset');
    const before = await layout();
    const rings = [];

    for (const focusRing of ['inside', 'outside', 'inside'] as const) {
      await root.update({ focusRing });
      await expect(action).toBeFocused();
      expect(await nativeButton.evaluate((element) => element === document.activeElement)).toBe(true);
      expect(await layout()).toEqual(before);
      const ring = await readFocusRing(action);
      expect(ring.style).toBe('solid');
      expect(ring.focusVisible).toBe(true);

      rings.push(ring);
    }

    const [firstInside, restoredOutside, secondInside] = rings;
    expect(firstInside.offset + firstInside.width).toBeLessThanOrEqual(0);
    expect(restoredOutside).toEqual(outside);
    expect(secondInside.offset + secondInside.width).toBeLessThanOrEqual(0);

    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(root.getByTestId('clicks')).toHaveText('2');
    await page.keyboard.press('Tab');
    await expect(root.getByRole('button', { name: 'After', exact: true })).toBeFocused();
    await action.focus();
    await expect(action).toBeFocused();
  });

  for (const theme of ['light', 'dark'] as const) {
    for (const forcedColors of ['none', 'active'] as const) {
      test(`inside rings remain visible and contrasting in ${theme}, forced colors ${forcedColors}`, async ({ mount, page }, testInfo) => {
        await page.setViewportSize({ width: 390, height: 900 });
        await page.emulateMedia({ forcedColors });
        const root = await mount(story);

        await root.evaluate(async (element, value) => {
          element.ownerDocument.documentElement.dataset.theme = value;
          await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
        }, theme);

        await page.evaluate(() => document.fonts.ready);

        const measurements = [];

        for (const item of focusRingCases) {
          const button = root.getByRole('button', { name: item.name, exact: true });
          const before = await readFieldLayout(button);
          await button.press('Shift');
          const ring = await readFocusRing(button);
          expect(ring.focused).toBe(true);
          expect(ring.focusVisible).toBe(true);
          expect(ring.style).toBe('solid');
          expect(ring.offset + ring.width).toBeLessThanOrEqual(0);
          expect(ring.clipClearance).not.toBeNull();
          expect(ring.clipClearance).toBeGreaterThanOrEqual(-0.5);
          expect(ring.contrast, item.name).toBeGreaterThanOrEqual(3);
          expect(await readFieldLayout(button)).toEqual(before);
          const field = button.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " DrControl ")]');
          await expect(field.locator('[data-dr-focus-surface]')).toHaveCSS('outline-style', 'none');
          measurements.push({ name: item.name, ...ring });
        }

        await testInfo.attach('focus-ring-measurements', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
        const solid = root.getByRole('button', { name: 'end normal solid', exact: true });
        await solid.press('Shift');
        await testInfo.attach('inside-ring', { body: await solid.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " DrControl ")]').screenshot(), contentType: 'image/png' });
      });
    }
  }

  test('native slot content reserves room for external focus outlines', async ({ mount }) => {
    const root = await mount(story);

    for (const target of [
      root.getByRole('button', { name: 'Native action', exact: true }),
      root.getByRole('link', { name: 'Slot link', exact: true }),
      root.getByRole('textbox', { name: 'Slot editor', exact: true }),
    ]) {
      await target.press('Shift');
      const ring = await readFocusRing(target);
      expect(ring.style).toBe('solid');
      expect(ring.offset).toBeGreaterThanOrEqual(0);
      expect(ring.clipClearance).toBeGreaterThanOrEqual(3.5);
    }
  });
});
