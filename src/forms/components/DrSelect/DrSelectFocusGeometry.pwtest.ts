import { expect, test } from '~/tests/playwright/fixtures';

test.describe('DrSelectFocusGeometry', () => {
  for (const [placement, top] of [['bottom', 80], ['top', 650.75]] as const) {
    test(`${placement} popup clears the external focus outline`, async ({ mount, page }) => {
      await page.setViewportSize({ width: 900, height: 800 });
      const root = await mount('forms/components/DrSelect/DrSelectPopup');

      await root.getByTestId('scroll-frame').evaluate((element, value) => {
        Object.assign(element.style, { position: 'fixed', left: '240px', top: `${value}px` });
      }, top);

      await root.getByRole('combobox').press('Enter');
      await expect(page.getByRole('listbox')).toBeVisible();
      const surface = root.locator('[data-dr-focus-surface]');
      await expect(surface).toHaveCSS('outline-style', 'solid');

      await expect.poll(() => surface.evaluate((element, side) => {
        const popup = document.querySelector('.DrSelect__popup');

        if (popup == null) {
          throw new Error('Expected an open Select popup.');
        }

        const field = element.getBoundingClientRect();
        const list = popup.getBoundingClientRect();
        const style = getComputedStyle(element);
        const outset = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);

        return side === 'bottom' ? list.top - field.bottom - outset : field.top - outset - list.bottom;
      }, placement)).toBeGreaterThan(0);
    });
  }
});
