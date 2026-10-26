import { expect, test } from '~/tests/playwright/fixtures';

const story = 'configuration/components/DrFrontProvider/DrFrontProviderGallery';

test('language changes and reset retain form state, inherited locale and the toast queue and timer', async ({ mount, page }) => {
  const component = await mount(story, { locale: 'en-GB' });
  const primary = component.getByTestId('primary');
  const language = component.getByRole('combobox', { name: 'Language', exact: true });
  const draft = primary.getByRole('textbox', { name: 'Primary draft' });
  const toast = page.locator('.DrToast');

  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  await expect(primary.getByTestId('effective-config')).toHaveText('en / en-GB');
  await draft.fill('Unfinished form');

  await draft.evaluate((element) => {
    element.setAttribute('data-retained', 'yes');
  });

  await language.selectOption('ru');
  await expect(primary.getByTestId('effective-config')).toHaveText('ru / en-GB');
  await primary.getByRole('button', { name: 'Notify', exact: true }).click();
  await primary.getByRole('button', { name: 'Queue notification', exact: true }).click();
  await expect(toast).toContainText('Ошибка');

  await toast.evaluate((element) => {
    element.setAttribute('data-retained', 'yes');
  });

  await page.clock.runFor(2000);
  await language.selectOption('en');
  await expect(toast).toContainText('Error');
  await language.selectOption({ label: 'Default' });
  await expect(primary.getByTestId('effective-config')).toHaveText('en / en-GB');
  await expect(draft).toHaveAttribute('data-retained', 'yes');
  await expect(draft).toHaveValue('Unfinished form');
  await expect(toast).toHaveAttribute('data-retained', 'yes');
  await page.mouse.move(0, 0);
  await page.clock.runFor(4300);
  await expect(toast).toContainText('Primary queued');
  await expect(toast).toContainText('Success');
});

test('mobile Select follows Host readiness and an open dialog survives language changes and reset', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const component = await mount(story, { ready: false });
  const primary = component.getByTestId('primary');
  const trigger = primary.getByRole('combobox', { name: 'Primary choice' });
  const language = component.getByRole('combobox', { name: 'Language', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Primary choice' });

  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(dialog).toHaveCount(0);
  await page.getByRole('listbox').getByRole('option', { name: 'Beta', exact: true }).click();
  await component.update({ ready: true });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('option', { name: 'Beta', exact: true })).toHaveAttribute('aria-selected', 'true');

  await dialog.evaluate((element) => {
    element.setAttribute('data-retained', 'yes');
  });

  await language.selectOption('ru', { force: true });
  await expect(dialog.getByRole('button', { name: 'Закрыть', exact: true })).toBeVisible();
  await language.selectOption('en', { force: true });
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  await language.selectOption({ label: 'Default' }, { force: true });
  await expect(dialog).toHaveAttribute('data-retained', 'yes');
  await expect(dialog.getByRole('option', { name: 'Beta', exact: true })).toHaveAttribute('aria-selected', 'true');
  await component.update({ ready: false });
  await expect(dialog).toHaveCount(0);
  await expect(primary).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(dialog).toHaveCount(0);
});

test('independent providers dispose only their own queues and overlays', async ({ mount, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const component = await mount(story, { multiple: true });
  const primary = component.getByTestId('primary');
  const secondary = component.getByTestId('secondary');
  const primaryDialog = page.getByRole('dialog', { name: 'Primary choice', includeHidden: true });
  const secondaryDialog = page.getByRole('dialog', { name: 'Secondary choice' });
  const toasts = page.locator('.DrToast');

  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));

  await page.locator('body').evaluate((body) => {
    body.style.setProperty('overflow', 'clip', 'important');
  });

  await secondary.getByRole('textbox', { name: 'Secondary draft' }).fill('Retained sibling');
  await primary.getByRole('button', { name: 'Notify', exact: true }).click();
  await primary.getByRole('button', { name: 'Queue notification', exact: true }).click();
  await secondary.getByRole('button', { name: 'Notify', exact: true }).click();
  await expect(toasts).toHaveCount(2);
  await primary.getByRole('combobox', { name: 'Primary choice' }).click();

  await secondary.getByRole('combobox', { name: 'Secondary choice' }).evaluate((trigger: HTMLButtonElement) => {
    trigger.click();
  });

  await expect(primaryDialog).toBeVisible();
  await expect(secondaryDialog).toBeVisible();
  await component.update({ multiple: true, mounted: false });
  await expect(primaryDialog).toHaveCount(0);
  await expect(secondaryDialog).toBeVisible();
  await expect(toasts).toHaveCount(1);
  await expect(toasts).toContainText('Secondary notification');
  await expect(secondary.getByRole('textbox', { name: 'Secondary draft' })).toHaveValue('Retained sibling');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await component.unmount();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(toasts).toHaveCount(0);
  await expect(page.locator('body')).toHaveCSS('overflow', 'clip');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});
