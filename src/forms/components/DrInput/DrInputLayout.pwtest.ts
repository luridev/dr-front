import { pasteInput, readSelection, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

test('input layout keeps editable text space with slots, narrow containers and different fonts', async ({ mount }, testInfo) => {
  const root = await mount('forms/components/DrInput/DrInputLayout');
  const layout = root.getByTestId('layout');
  const measurements = [];
  const sweeps = [];

  for (const font of ['system-ui', 'Liberation Sans']) {
    for (const width of [320, 180, 80]) {
      await layout.evaluate((element, options) => {
        element.style.width = `${options.width}px`;
        element.style.fontFamily = options.font;
      }, { font, width });

      const bounds = await layout.evaluate((element) => ({
        left: element.getBoundingClientRect().left,
        right: element.getBoundingClientRect().right,
      }));

      for (const name of ['Plain', 'Address', 'Masked', 'Nested', 'Readonly', 'Disabled', 'Decorated']) {
        const input = root.getByRole('textbox', { name, exact: true });

        const geometry = await input.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const surface = element.closest<HTMLElement>('[data-dr-focus-surface]');

          if (surface == null) {
            throw new Error('The input focus surface is missing.');
          }

          return {
            left: rect.left,
            right: rect.right,
            width: rect.width,
            textWidth: rect.width - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)
              - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth),
            fontSize: Number.parseFloat(style.fontSize),
            overflow: surface.scrollWidth - surface.clientWidth,
          };
        });

        measurements.push({ font, containerWidth: width, name, ...geometry });

        expect(geometry.textWidth, `${font}, ${width}px, ${name}: room for a glyph`).toBeGreaterThanOrEqual(geometry.fontSize - 0.5);
        expect(geometry.left).toBeGreaterThanOrEqual(bounds.left - 0.5);
        expect(geometry.right).toBeLessThanOrEqual(bounds.right + 0.5);
        expect(geometry.overflow, `${name}: slot content remains visible`).toBeLessThanOrEqual(1);
      }

      for (const decoration of [root.getByRole('button', { name: 'Go', exact: true }), root.locator('.DrCheckIcon')]) {
        await expect(decoration).toBeVisible();
        const decorationBounds = await decoration.boundingBox();
        expect(decorationBounds?.x).toBeGreaterThanOrEqual(bounds.left - 0.5);
        expect((decorationBounds?.x ?? 0) + (decorationBounds?.width ?? 0)).toBeLessThanOrEqual(bounds.right + 0.5);
      }

      const masked = root.getByRole('textbox', { name: 'Masked', exact: true });
      await masked.fill('654321');
      await expect(masked).toHaveValue('654-321');
      await expect(root.getByTestId('masked-model')).toHaveText('654321');
      expect(await readSelection(masked)).toEqual([7, 7]);
    }

    const narrowest = await layout.evaluate((element) => {
      let result = { containerWidth: 0, textWidth: Number.POSITIVE_INFINITY, fontSize: 0 };

      for (let width = 80; width <= 320; width += 1) {
        element.style.width = `${width}px`;

        for (const input of element.querySelectorAll('input')) {
          const style = getComputedStyle(input);

          const textWidth = input.getBoundingClientRect().width
            - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)
            - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth);

          if (textWidth < result.textWidth) {
            result = { containerWidth: width, textWidth, fontSize: Number.parseFloat(style.fontSize) };
          }
        }
      }

      return result;
    });

    sweeps.push({ font, ...narrowest });

    expect(narrowest.textWidth, `${font}, ${narrowest.containerWidth}px: room between wrapping points`)
      .toBeGreaterThanOrEqual(narrowest.fontSize - 0.5);
  }

  await testInfo.attach('input-layout', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
  await testInfo.attach('input-layout-sweep', { body: JSON.stringify(sweeps, null, 2), contentType: 'application/json' });
});

test('input layout preserves editing, selection, paste and clear in a narrow field', async ({ mount }) => {
  const root = await mount('forms/components/DrInput/DrInputLayout');

  await root.getByTestId('layout').evaluate((element) => {
    element.style.width = '80px';
    element.style.fontFamily = 'Liberation Sans';
  });

  const masked = root.getByRole('textbox', { name: 'Masked', exact: true });
  await masked.fill('654321');
  await selectInputRange(masked, 1, 3);
  expect(await readSelection(masked)).toEqual([1, 3]);
  await masked.press('9');
  await expect(masked).toHaveValue('693-21');
  await expect(root.getByTestId('masked-model')).toHaveText('69321');
  expect(await readSelection(masked)).toEqual([2, 2]);
  await root.getByRole('button', { name: 'Clear Masked', exact: true }).click();
  await expect(masked).toHaveValue('');
  await expect(masked).toBeFocused();
  await expect(root.getByTestId('masked-model')).toHaveText('');

  const plain = root.getByRole('textbox', { name: 'Plain', exact: true });
  await plain.fill('abcdef');
  await selectInputRange(plain, 1, 3);
  await pasteInput(plain, 'XY');
  await expect(plain).toHaveValue('aXYdef');
  expect(await readSelection(plain)).toEqual([3, 3]);

  const readonly = root.getByRole('textbox', { name: 'Readonly', exact: true });
  await expect(readonly).toHaveValue('aXYdef');
  await expect(readonly).not.toBeEditable();
  await selectInputRange(readonly, 0, 6);
  await expect(readonly).toBeFocused();
  expect(await readSelection(readonly)).toEqual([0, 6]);
  await readonly.press('Delete');
  await expect(readonly).toHaveValue('aXYdef');
  await expect(root.getByRole('textbox', { name: 'Disabled', exact: true })).toBeDisabled();
  await root.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(root.getByTestId('slot-actions')).toHaveText('1');
});
