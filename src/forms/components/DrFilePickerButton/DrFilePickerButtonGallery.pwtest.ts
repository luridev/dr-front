import { expect, test } from '~/tests/playwright/fixtures';

const story = 'forms/components/DrFilePickerButton/DrFilePickerButtonGallery';

test('file selection emits a native File and supports choosing the same file again', async ({ mount, page }) => {
  const component = await mount(story);
  const button = component.getByRole('button', { name: 'Choose image', exact: true });
  const input = component.getByLabel('Choose image', { exact: true });
  const selection = component.getByTestId('selected-file');
  const file = { name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from('image') };

  await expect(input).toHaveAttribute('accept', 'image/*');

  for (const count of [1, 2]) {
    const choosing = page.waitForEvent('filechooser');
    await button.click();
    const chooser = await choosing;

    await chooser.setFiles(file);
    await expect(selection).toHaveText('sample.png · 5 bytes');
    await expect(selection).toHaveAttribute('data-native-file', 'true');
    await expect(selection).toHaveAttribute('data-file-type', 'image/png');
    await expect(selection).toHaveAttribute('data-selections', String(count));
    await expect(input).toHaveValue('');
  }

  await input.setInputFiles([]);
  await expect(selection).toHaveAttribute('data-selections', '2');
  await expect(selection).toHaveText('sample.png · 5 bytes');
});

test('disabled and loading states block a pending file selection and allow recovery', async ({ mount, page }) => {
  const component = await mount(story);
  const button = component.getByRole('button', { name: 'Choose image', exact: true });
  const input = component.getByLabel('Choose image', { exact: true });
  const selection = component.getByTestId('selected-file');
  const file = { name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from('image') };

  for (const props of [{ disabled: true }, { loading: true }]) {
    const choosing = page.waitForEvent('filechooser');
    await button.click();
    const chooser = await choosing;

    await component.update(props);
    await expect(button).toBeDisabled();
    await expect(input).toBeDisabled();
    await chooser.setFiles(file);
    await expect(selection).toHaveAttribute('data-selections', '0');
    await expect(selection).toHaveText('No file selected');
    await component.update({});
    await expect(button).toBeEnabled();
    await expect(input).toBeEnabled();
  }

  await input.setInputFiles(file);
  await expect(selection).toHaveAttribute('data-selections', '1');
  await expect(selection).toHaveText('sample.png · 5 bytes');
});
