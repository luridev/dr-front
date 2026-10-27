import { standardDesktopViewport } from '~/tests/playwright/config';
import { expect, test } from '~/tests/playwright/fixtures';

const selectDialogStoryId = 'forms/components/DrSelect/DrSelectDialog/DrSelectDialog';

test('direct content and consumer spacing scroll with the body while the header and footer stay visible', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 220 });
  const root = await mount(selectDialogStoryId);
  await root.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const body = dialog.locator('.DrDialog__body');
  const header = dialog.locator('header');
  const footer = dialog.locator('footer');

  await expect(body).toHaveCSS('padding', '0px');
  await expect(header).toBeInViewport({ ratio: 1 });
  await expect(footer).toBeInViewport({ ratio: 1 });
  const headerBefore = await header.boundingBox();
  const footerBefore = await footer.boundingBox();
  const dialogBefore = await dialog.boundingBox();
  const outsideScroll = await dialog.evaluate((element) => [element.scrollTop, scrollY]);
  await expect(body.getByText('Choose an option below.', { exact: true })).toBeInViewport({ ratio: 1 });

  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(body.getByText('Scroll back to change your choice.', { exact: true })).toBeInViewport({ ratio: 1 });
  expect(await header.boundingBox()).toEqual(headerBefore);
  expect(await footer.boundingBox()).toEqual(footerBefore);
  expect(await dialog.boundingBox()).toEqual(dialogBefore);
  expect(await dialog.evaluate((element) => [element.scrollTop, scrollY])).toEqual(outsideScroll);
  const trigger = body.getByRole('combobox', { name: 'Dialog select', exact: true });
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect(trigger).toBeInViewport({ ratio: 1 });
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

test('popup escapes the panel without scrolling it and preserves modal Tab and Escape', async ({ mount, page }) => {
  await page.setViewportSize(standardDesktopViewport);
  const root = await mount(selectDialogStoryId);
  await root.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const trigger = dialog.getByRole('combobox');
  const body = dialog.locator('.DrDialog__body');

  await dialog.locator('.DrDialog__panel').evaluate((element: HTMLElement) => {
    element.style.transform = 'translateZ(0)';
  });

  const before = await body.evaluate((element) => [element.scrollHeight, element.scrollTop, scrollY]);
  await trigger.click();
  const list = dialog.getByRole('listbox');
  await expect(list.getByRole('option').last()).toBeInViewport({ ratio: 1 });
  expect(await body.evaluate((element) => [element.scrollHeight, element.scrollTop, scrollY])).toEqual(before);
  const panel = await dialog.locator('.DrDialog__panel').boundingBox();
  const popup = await list.boundingBox();
  expect((popup?.y ?? 0) + (popup?.height ?? 0)).toBeGreaterThan((panel?.y ?? 0) + (panel?.height ?? 0));
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await expect(list).toHaveCount(0);

  await page.keyboard.press('Shift+Tab');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(list).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('nested mobile Select keeps Tab navigation within the topmost dialog', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const component = await mount(selectDialogStoryId);
  const outerDialog = page.getByRole('dialog', { name: 'Select dialog', exact: true });
  const trigger = outerDialog.getByRole('combobox', { name: 'Dialog select', exact: true });
  const innerDialog = page.getByRole('dialog', { name: 'Dialog select', exact: true });
  const listbox = innerDialog.getByRole('listbox');
  const innerClose = innerDialog.getByRole('button', { name: 'Close', exact: true });

  await component.getByRole('button', { name: 'Open dialog', exact: true }).click();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(listbox).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(innerClose).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(listbox).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(innerDialog).toHaveCount(0);
  await expect(outerDialog).toBeVisible();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(outerDialog).toHaveCount(0);
});
