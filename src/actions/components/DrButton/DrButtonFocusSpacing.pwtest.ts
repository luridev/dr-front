import { expect, test } from '~/tests/playwright/fixtures';

for (const theme of ['light', 'dark'] as const) {
  test(`button messages clear the painted focus outline in ${theme}`, async ({ mount, page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    const root = await mount('actions/components/DrButton/DrButtonGallery');

    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);

    await page.evaluate(() => document.fonts.ready);

    for (const name of ['Continue', 'Reset count']) {
      const button = root.locator('.DrButtonRoot_withMessage').getByRole('button', { name, exact: true });
      const before = await button.locator('..').boundingBox();
      await button.press('Shift');
      await expect(button).toBeFocused();

      const geometry = await button.evaluate((element) => {
        const message = element.parentElement?.querySelector('.DrButtonRoot__message');

        if (message == null) {
          throw new Error('Expected a button message.');
        }

        const style = getComputedStyle(element);
        const outset = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);

        return {
          outlineStyle: style.outlineStyle,
          clearance: message.getBoundingClientRect().top - element.getBoundingClientRect().bottom - outset,
        };
      });

      expect(geometry.outlineStyle).toBe('solid');
      expect(geometry.clearance).toBeGreaterThanOrEqual(3.5);
      const after = await button.locator('..').boundingBox();
      expect(after?.height).toBe(before?.height);
      expect(after?.width).toBe(before?.width);
    }
  });
}
