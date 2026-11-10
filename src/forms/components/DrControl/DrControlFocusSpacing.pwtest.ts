import { getControlGeometry } from '@/forms/components/DrControl/DrControlFocusSpacing.support';
import { expect, test } from '~/tests/playwright/fixtures';

test.describe('DrControlFocusSpacing', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [390, 1280]) {
      test(`bordered fields leave readable focus clearance in ${theme} at ${width}px`, async ({ mount, page }) => {
        await page.setViewportSize({ width, height: 900 });
        const root = await mount('configuration/components/DrFrontProvider/FocusShowcase/FocusShowcase');

        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);

        await page.evaluate(() => document.fonts.ready);

        const editors = [
          'Input', 'Masked input', 'Number', 'Date', 'Time', 'Textarea',
          'Invalid input', 'Invalid textarea', 'Read-only input',
        ];

        for (const name of [...editors, 'City', 'Invalid select']) {
          const field = page.getByLabel(name, { exact: true });
          const control = root.locator('.DrControl').filter({ has: field });
          await root.locator('.DrFocusShowcase__intro').first().click();
          const before = await getControlGeometry(control);

          await field.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(field).toBeFocused();
          await expect(control.locator(':scope > .DrControl__control')).toHaveCSS('outline-style', 'solid');
          const focused = await getControlGeometry(control);
          expect(focused.outlineStyle).toBe('solid');
          expect(focused.labelClearance, `${name}: label outside the painted outline`).toBeGreaterThanOrEqual(3.5);

          expect(focused.messageClearance === null || focused.messageClearance >= 3.5,
            `${name}: any message stays outside the painted outline`).toBe(true);

          expect(focused.layout).toEqual(before.layout);
        }

        for (const name of editors) {
          const field = page.getByLabel(name, { exact: true });
          const control = root.locator('.DrControl').filter({ has: field });
          const before = await getControlGeometry(control);
          await root.locator('.DrFocusShowcase__intro').first().click();
          await field.click();
          const clicked = await getControlGeometry(control);
          expect(clicked.outlineStyle).toBe('solid');
          expect(clicked.labelClearance).toBeGreaterThanOrEqual(3.5);
          expect(clicked.layout).toEqual(before.layout);
        }

        const radio = root.locator('.DrControl').filter({ has: page.getByRole('radiogroup') });
        expect((await getControlGeometry(radio)).labelGap).toBeCloseTo(4);
        const checkbox = root.locator('.DrControl').filter({ has: page.getByRole('checkbox', { name: 'Notifications', exact: true }) });
        expect((await getControlGeometry(checkbox)).rightGap).toBeCloseTo(8);
      });
    }
  }

  test('group layouts keep top labels and messages clear of focus outlines', async ({ mount, page }) => {
    for (const scenario of [
      { labelPosition: 'auto', width: 390 },
      { labelPosition: 'top', width: 900 },
      { labelPosition: 'left', fieldLabelPosition: 'top', width: 900 },
    ]) {
      await page.setViewportSize({ width: scenario.width, height: 900 });

      const root = await mount('forms/components/DrControlGroup/DrControlGroupGallery', {
        labelPosition: scenario.labelPosition,
        fieldLabelPosition: scenario.fieldLabelPosition,
      });

      const input = page.getByRole('textbox', { name: 'Name', exact: true });
      const control = root.locator('.DrControl').filter({ has: input });
      const before = await getControlGeometry(control);

      await page.keyboard.press('Tab');
      await expect(input).toBeFocused();
      const focused = await getControlGeometry(control);
      expect(focused.outlineStyle).toBe('solid');
      expect(focused.layout).toEqual(before.layout);
      expect(focused.messageClearance).toBeGreaterThanOrEqual(3.5);
      expect(focused.labelClearance).toBeGreaterThanOrEqual(3.5);

      await root.getByRole('button', { name: 'Validate', exact: true }).click();
      await input.press('Shift');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      expect((await getControlGeometry(control)).messageClearance).toBeGreaterThanOrEqual(3.5);
      expect((await getControlGeometry(control)).layout.surfaceLeft).toBe(before.layout.surfaceLeft);
    }
  });

  test('group layouts preserve side labels and reserve clearance for normal and error messages', async ({ mount, page }) => {
    for (const scenario of [
      { labelPosition: 'auto', width: 900, expected: 'left' },
      { labelPosition: 'left', width: 390, expected: 'left' },
      { labelPosition: 'top', fieldLabelPosition: 'left', width: 900, expected: 'left' },
      { labelPosition: 'left', fieldLabelPosition: 'right', width: 900, expected: 'right' },
    ]) {
      await page.setViewportSize({ width: scenario.width, height: 900 });

      const root = await mount('forms/components/DrControlGroup/DrControlGroupGallery', {
        labelPosition: scenario.labelPosition,
        fieldLabelPosition: scenario.fieldLabelPosition,
      });

      const input = page.getByRole('textbox', { name: 'Name', exact: true });
      const control = root.locator('.DrControl').filter({ has: input });
      const email = root.locator('.DrControl').filter({ has: page.getByRole('textbox', { name: 'Email', exact: true }) });
      const before = await getControlGeometry(control);

      await page.keyboard.press('Tab');
      await expect(input).toBeFocused();
      const focused = await getControlGeometry(control);
      expect(focused.outlineStyle).toBe('solid');
      expect(focused.layout).toEqual(before.layout);
      expect(focused.messageClearance).toBeGreaterThanOrEqual(3.5);

      expect(scenario.expected === 'left' ? focused.leftGap : focused.rightGap).toBeCloseTo(scenario.expected === 'left' ? 16 : 8);
      expect((await getControlGeometry(email)).bottomSpace).toBeCloseTo(4);

      await root.getByRole('button', { name: 'Validate', exact: true }).click();
      await input.press('Shift');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      expect((await getControlGeometry(control)).messageClearance).toBeGreaterThanOrEqual(3.5);
      expect((await getControlGeometry(control)).layout.surfaceLeft).toBe(before.layout.surfaceLeft);
    }
  });
});
