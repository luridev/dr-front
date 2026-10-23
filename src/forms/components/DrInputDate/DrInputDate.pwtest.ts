import { maskingStoryId as storyId } from '@/forms/components/DrInput/DrInputMasking/config.support';
import { getInput, pasteInput, replaceInput, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { expect, test } from '~/tests/playwright/fixtures';

const dateStoryId = 'forms/components/DrInputDate/DrInputDateGallery';

test('regional leap-day validation exposes errors and recovers its accessible description', async ({ mount }) => {
  const root = await mount(dateStoryId);
  const input = root.getByRole('textbox', { name: 'Date', exact: true });
  const model = root.getByTestId('date-gallery-model');

  for (const locale of ['ru-RU', 'en-US', 'en-GB']) {
    await root.getByRole('combobox', { name: 'Locale', exact: true }).selectOption(locale);
    const prefix = locale === 'en-US' ? '0229' : '2902';

    await replaceInput(input, `${prefix}1900`);
    await expect(model).toHaveText('null');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Invalid date');
    await replaceInput(input, `${prefix}2000`);
    await expect(model).toHaveText('2000-02-29');
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).toHaveAccessibleDescription('Valid date');
    await input.fill(prefix);
    await expect(model).toHaveText('null');
    await expect(input).toHaveAccessibleDescription('Incomplete date');
    await root.getByRole('button', { name: 'Clear date', exact: true }).click();
    await expect(input).toBeFocused();
    await expect(input).toHaveAccessibleDescription('Empty');
  }
});

test('date supports signed extended years, Temporal boundaries and external year padding', async ({ mount }) => {
  const root = await mount(storyId);
  const input = getInput(root, 'date');

  await replaceInput(input, '01022026');
  await expect(input).toHaveValue('01/02/2026');
  await expect(root.getByTestId('date-model')).toHaveText('2026-01-02');

  for (const [text, model] of [
    ['01010000', '0000-01-01'], ['01010001', '0001-01-01'], ['0201-100000', '-100000-02-01'],
    ['0419-271821', '-271821-04-19'], ['0913275760', '+275760-09-13'],
  ]) {
    await replaceInput(input, text);
    await expect(root.getByTestId('date-model')).toHaveText(model);
    await input.press('Enter');
    await input.press('Tab');
    await expect(root.getByTestId('date-model')).toHaveText(model);
  }

  for (const [model, text] of [['0000-01-01', '01/01/0000'], ['0010-02-01', '02/01/0010'], ['-000001-02-01', '02/01/-0001']]) {
    await root.update({ externalDate: model });
    await expect(input).toHaveValue(text);
  }

  await input.fill('');
  await pasteInput(input, '02/01/-100000');
  await expect(root.getByTestId('date-model')).toHaveText('-100000-02-01');

  for (const [text, status] of [['02312026', 'invalid'], ['0914275760', 'out-of-range'], ['0101-', 'incomplete']]) {
    await replaceInput(input, text);
    await expect(root.getByTestId('date-model')).toHaveText('null');
    await expect(root.getByTestId('date-status')).toHaveText(status);
  }
});

for (const sample of [
  { locale: 'ru-RU', text: '0102100000', monthStart: 3, dayStart: 0 },
  { locale: 'en-US', text: '0201100000', monthStart: 0, dayStart: 3 },
]) {
  test(`date repairs segments and preserves extended years through history in ${sample.locale}`, async ({ mount }) => {
    const root = await mount(dateStoryId);
    const input = root.getByRole('textbox', { name: 'Date', exact: true });
    const model = root.getByTestId('date-gallery-model');

    await root.getByRole('combobox', { name: 'Locale', exact: true }).selectOption(sample.locale);
    await replaceInput(input, sample.text);
    await selectInputRange(input, sample.monthStart, sample.monthStart + 2);
    await input.pressSequentially('03');
    await expect(model).toHaveText('+100000-03-01');
    await input.press('ControlOrMeta+Z');
    await expect(input).toHaveValue(/[./]100000$/);
    await input.press('ControlOrMeta+Shift+Z');
    await expect(model).toHaveText('+100000-03-01');
    await selectInputRange(input, sample.monthStart, sample.monthStart + 2);
    await input.press('Delete');
    await expect(input).toHaveValue(/[./]100000$/);
    await expect(model).toHaveText('null');
    await selectInputRange(input, sample.monthStart, sample.monthStart + 2);
    await input.pressSequentially('04');
    await expect(model).toHaveText('+100000-04-01');
    await selectInputRange(input, sample.dayStart, sample.dayStart + 2);
    await input.press('Backspace');
    await expect(input).toHaveValue(/[./]100000$/);
    await expect(model).toHaveText('null');
    await selectInputRange(input, sample.dayStart, sample.dayStart + 2);
    await input.pressSequentially('02');
    await expect(model).toHaveText('+100000-04-02');
    await selectInputRange(input, 6);
    await input.press('-');
    await expect(model).toHaveText('-100000-04-02');
    await selectInputRange(input, 6, 7);
    await input.press('Delete');
    await expect(model).toHaveText('+100000-04-02');
    await selectInputRange(input, 6, 12);
    await input.pressSequentially('100001');
    await expect(model).toHaveText('+100001-04-02');
    await selectInputRange(input, 6, 12);
    await pasteInput(input, '-100000');
    await expect(model).toHaveText('-100000-04-02');
  });
}

test('date switches regional formats without replacing its model or input and clears incomplete drafts', async ({ mount }) => {
  const root = await mount(dateStoryId);
  const input = root.getByRole('textbox', { name: 'Date', exact: true });
  const readonlyInput = root.getByRole('textbox', { name: 'Read-only date', exact: true });
  const model = root.getByTestId('date-gallery-model');
  const localeSelect = root.getByRole('combobox', { name: 'Locale', exact: true });

  await input.evaluate((element) => {
    element.setAttribute('data-retained', 'yes');
  });

  for (const [locale, text, placeholder] of [
    ['ru-RU', '01.02.2026', 'DD.MM.YYYY'],
    ['en-US', '02/01/2026', 'MM/DD/YYYY'],
    ['en-GB', '01/02/2026', 'DD/MM/YYYY'],
    ['ru-RU', '01.02.2026', 'DD.MM.YYYY'],
  ]) {
    await localeSelect.selectOption(locale);
    await expect(input).toHaveValue(text);
    await expect(readonlyInput).toHaveValue(text);
    await expect(input).toHaveAttribute('placeholder', placeholder);
    await expect(input).toHaveAttribute('data-retained', 'yes');
    await expect(model).toHaveText('2026-02-01');
    await expect(model).toHaveAttribute('data-updates', '0');
    await expect(model).toHaveAttribute('data-initial-identity', 'true');
  }

  for (const [locale, text, iso] of [
    ['ru-RU', '01.02.2026', '2026-02-01'],
    ['en-US', '01/02/2026', '2026-01-02'],
    ['en-GB', '01/02/2026', '2026-02-01'],
  ]) {
    await localeSelect.selectOption(locale);
    await replaceInput(input, '01022026');
    await expect(input).toHaveValue(text);
    await expect(model).toHaveText(iso);
  }

  await input.fill('0102');
  await expect(model).toHaveText('null');
  const updatesBeforeLocale = await model.getAttribute('data-updates');

  await localeSelect.selectOption('en-US');
  await expect(input).toHaveValue('');
  await expect(model).toHaveText('null');
  await expect(model).toHaveAttribute('data-updates', updatesBeforeLocale ?? '');
  await replaceInput(input, '12312026');
  await expect(input).toHaveValue('12/31/2026');
  await expect(model).toHaveText('2026-12-31');
});

test('date inherits nested configuration and keeps mask history when only language changes', async ({ mount }) => {
  const root = await mount('configuration/components/DrConfigProvider/DrConfigProviderGallery');
  const configured = root.getByTestId('configured');
  const input = configured.getByRole('textbox', { name: 'Date', exact: true });
  const nestedInput = root.getByTestId('nested').getByRole('textbox', { name: 'Date', exact: true });
  const languageSelect = root.getByRole('combobox', { name: 'Language', exact: true });
  const localeSelect = root.getByRole('combobox', { name: 'Locale', exact: true });

  await expect(input).toHaveValue('02/01/2026');
  await expect(nestedInput).toHaveValue('01.02.2026');
  await languageSelect.selectOption('ru');
  await expect(input).toHaveValue('01.02.2026');
  await languageSelect.selectOption('en');
  await expect(input).toHaveValue('02/01/2026');
  await expect(nestedInput).toHaveValue('01.02.2026');
  await localeSelect.selectOption('en-US');
  await expect(nestedInput).toHaveValue('02/01/2026');
  await input.fill('0102202');
  await input.press('End');
  await input.press('6');
  await expect(input).toHaveValue('01/02/2026');
  await languageSelect.selectOption('ru');
  await expect(input).toHaveValue('01/02/2026');
  await expect(configured.getByRole('button', { name: 'Очистить поле «Date»', exact: true })).toBeVisible();
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('01/02/202');
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue('01/02/2026');
  await localeSelect.selectOption('en-GB');
  await expect(input).toHaveValue('02/01/2026');
  await expect(nestedInput).toHaveValue('01/02/2026');
});
