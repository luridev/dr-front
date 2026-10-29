import { expect, test } from '~/tests/playwright/fixtures';

const story = 'configuration/components/DrConfigProvider/DrConfigProviderGallery';

test('language updates built-in UI and aria without remounting or translating consumer text', async ({ mount, page }) => {
  const component = await mount(story);
  const configured = component.getByTestId('configured');
  const email = configured.getByRole('textbox', { name: 'Email', exact: true });

  await email.fill('Retained text');

  await email.evaluate((element) => {
    element.setAttribute('data-retained', 'yes');
  });

  await expect(configured.getByRole('button', { name: 'Clear Email', exact: true })).toBeVisible();
  await expect(configured.getByRole('button', { name: 'Choose file', exact: true })).toBeVisible();
  await expect(configured.getByRole('spinbutton')).toHaveAttribute('aria-valuetext', 'No value specified');
  await expect(configured.getByRole('combobox').last()).toHaveText('No options available');
  await expect(configured.getByRole('alert')).toContainText('Operation failed');
  await component.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ru');
  await expect(email).toHaveAttribute('data-retained', 'yes');
  await expect(email).toHaveValue('Retained text');
  await expect(configured.getByTestId('resolved-config')).toHaveText('ru / ru-RU');
  await expect(configured.getByRole('button', { name: 'Очистить поле «Email»', exact: true })).toBeVisible();
  await expect(configured.getByRole('button', { name: 'Application clear', exact: true })).toBeVisible();
  await expect(configured.getByRole('button', { name: 'Увеличить значение поля «Count»' })).toBeVisible();
  await expect(configured.getByRole('button', { name: 'Выбрать файл', exact: true })).toBeVisible();
  await expect(configured.getByRole('button', { name: 'Очистить поле «Notes»' })).toHaveText('Очистить');
  await expect(configured.getByRole('spinbutton')).toHaveAttribute('aria-valuetext', 'Значение не задано');
  await expect(configured.getByRole('alert')).toContainText('Operation failed');
  await expect(configured.getByRole('alert')).toContainText('Application error details');
  await expect(component.getByTestId('providerless').getByRole('button', { name: 'Choose file' })).toBeVisible();
  await component.getByRole('combobox', { name: 'Locale', exact: true }).selectOption('en-GB');
  await expect(configured.getByTestId('resolved-config')).toHaveText('ru / en-GB');
  await expect(configured.getByRole('combobox').last()).toHaveText('Нет вариантов для выбора');
  await page.setViewportSize({ width: 390, height: 844 });
  await configured.getByRole('combobox').first().click();
  await expect(page.getByRole('dialog', { name: 'Выберите вариант' })).toBeVisible();
  await page.keyboard.press('Escape');
});

test('open toast translates without reannouncing, replacing its node or restarting its timer', async ({ mount, page }) => {
  await page.clock.install();
  const component = await mount(story);
  const configured = component.getByTestId('configured');
  const toast = page.locator('.DrToast');
  const announcement = page.locator('.DrToastHost').filter({ has: toast }).getByRole('status');

  await component.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ru');
  await configured.getByRole('button', { name: 'Automatic toast' }).click();
  await configured.getByRole('button', { name: 'Queue toast' }).click();

  await toast.evaluate((element) => {
    element.setAttribute('data-retained', 'yes');
  });

  await expect(toast).toContainText('Ошибка');
  await expect(announcement).toHaveText('Ошибка: Application message');
  const initialAnnouncement = await announcement.innerText();

  await page.clock.runFor(2000);
  await component.getByRole('combobox', { name: 'Language', exact: true }).selectOption('en');
  await expect(toast).toContainText('Error');
  await expect(announcement).toHaveText(initialAnnouncement);
  await expect(toast).toHaveAttribute('data-retained', 'yes');
  await expect(toast.getByRole('button', { name: 'Dismiss notification' })).toBeVisible();
  await component.getByLabel('Override translations', { exact: true }).check();
  await expect(toast).toContainText('Custom error');
  await expect(announcement).toHaveText(initialAnnouncement);
  await component.getByLabel('Override translations', { exact: true }).uncheck();
  await expect(toast).toContainText('Error');
  await expect(announcement).toHaveText(initialAnnouncement);
  await page.mouse.move(0, 0);
  await page.clock.runFor(4300);
  await expect(toast).toContainText('Queued message');
  await expect(toast).toContainText('Success');
  await expect(announcement).toHaveText('Success: Queued message');
  await toast.getByRole('button').click();
  await page.clock.runFor(300);
  await expect(toast).toHaveCount(0);
  await configured.getByRole('button', { name: 'Explicit toast' }).click();
  await component.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ru');
  await expect(toast).toContainText('Application title');
  await expect(toast).toContainText('Explicit message');
});

test('programmatic dialogs retain caller configuration and react to nested and inherited overrides', async ({ mount, page }) => {
  const component = await mount(story);
  const configured = component.getByTestId('configured');
  const nested = component.getByTestId('nested');
  const dialog = page.getByRole('dialog', { name: 'Configured dialog' });

  await expect(nested.getByTestId('resolved-config')).toHaveText('ru / ru-RU');
  await nested.getByRole('button', { name: 'Open dialog' }).click();
  await expect(dialog.getByTestId('dialog-config')).toHaveText('ru / ru-RU');
  await expect(dialog.getByRole('button', { name: 'Готово', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Очистить поле «Dialog value»' })).toBeVisible();

  await component.getByLabel('Override translations', { exact: true }).evaluate((input: HTMLInputElement) => {
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(dialog.getByRole('button', { name: 'Reset Dialog value' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Готово', exact: true })).toBeVisible();

  await component.getByRole('combobox', { name: 'Locale', exact: true }).selectOption('en-GB', { force: true });
  await expect(dialog.getByTestId('dialog-config')).toHaveText('ru / en-GB');
  await dialog.getByRole('button', { name: 'Готово', exact: true }).click();
  await component.getByLabel('Override translations', { exact: true }).check();
  await configured.getByRole('button', { name: 'Open dialog' }).click();
  await expect(dialog.getByRole('button', { name: 'Dismiss', exact: true })).toBeVisible();

  await component.getByLabel('English close message').evaluate((input: HTMLInputElement) => {
    input.value = 'Done';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(dialog.getByRole('button', { name: 'Done', exact: true })).toBeVisible();
  await component.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ru', { force: true });
  await expect(dialog.getByRole('button', { name: 'Закрыть окно', exact: true })).toBeVisible();
  await expect(dialog.getByTestId('dialog-config')).toHaveText('ru / en-GB');

  await component.getByLabel('Override translations', { exact: true }).evaluate((input: HTMLInputElement) => {
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(dialog.getByRole('button', { name: 'Закрыть', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
});
