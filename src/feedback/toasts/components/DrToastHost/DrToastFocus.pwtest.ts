import { expect, test } from '~/tests/playwright/fixtures';

const story = 'feedback/toasts/components/DrToastHost/DrToastGallery';

test.describe('DrToastFocus', () => {
  test('closing a focused toast restores its entry target and allows Tab during the leave animation', async ({ mount, page }) => {
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 60_000));
    const root = await mount(story);
    const origin = root.getByRole('button', { name: 'Show queue', exact: true });
    const toast = page.locator('.DrToast');
    const previous = root.getByRole('button', { name: 'Error', exact: true });

    for (const key of ['Enter', 'Space']) {
      await origin.focus();

      await root.getByRole('button', { name: 'Information', exact: true }).evaluate((button: HTMLButtonElement) => {
        button.click();
      });

      await page.clock.runFor(300);
      await expect(origin).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(toast.getByRole('button')).toBeFocused();
      await page.keyboard.press(key);
      await expect(origin).toBeFocused();
      await expect(toast).toBeAttached();
      await page.keyboard.press('Shift+Tab');
      await expect(previous).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(origin).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(toast.locator('button')).not.toBeFocused();
      await page.clock.runFor(300);
      await expect(toast).toHaveCount(0);
    }
  });

  test('closing a toast after focus has left it preserves the current focus', async ({ mount, page }) => {
    const root = await mount(story);
    const origin = root.getByRole('button', { name: 'Information', exact: true });
    const outside = root.getByRole('textbox', { name: 'Message', exact: true });
    const toast = page.locator('.DrToast');

    await origin.focus();
    await origin.press('Enter');
    await toast.getByRole('button').focus();
    await outside.focus();

    await toast.getByRole('button').evaluate((button: HTMLButtonElement) => {
      button.click();
    });

    await expect(toast).toHaveCount(0);
    await expect(outside).toBeFocused();
  });

  test('closing a toast with an unavailable return target does not choose another element', async ({ mount, page }) => {
    const root = await mount(story);
    const origin = root.getByRole('button', { name: 'Information', exact: true, includeHidden: true });
    const toast = page.locator('.DrToast');

    for (const state of ['disabled', 'hidden', 'inert', 'removed']) {
      await origin.focus();
      await origin.press('Enter');
      await toast.getByRole('button').focus();

      await origin.evaluate((button: HTMLButtonElement, value) => {
        if (value === 'removed') {
          button.remove();
        } else if (value === 'hidden') {
          button.style.display = 'none';
        } else {
          button.setAttribute(value, '');
        }
      }, state);

      await page.keyboard.press('Enter');
      await expect(toast).toHaveCount(0);
      await expect(page.locator('body')).toBeFocused();

      if (state !== 'removed') {
        await origin.evaluate((button: HTMLButtonElement, value) => {
          button.style.removeProperty('display');
          button.removeAttribute(value);
        }, state);
      }
    }
  });
});
