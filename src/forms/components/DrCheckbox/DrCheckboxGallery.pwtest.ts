import { expect, test } from '~/tests/playwright/fixtures';

test('checkbox label, keyboard and external updates keep the model and accessible feedback in sync', async ({ mount }) => {
  const component = await mount('forms/components/DrCheckbox/DrCheckboxGallery');
  const checkbox = component.getByRole('checkbox', { name: 'Accept terms', exact: true });
  const label = component.locator('label').filter({ hasText: 'Accept terms' });
  const output = component.locator('.GalleryExample__output');
  const id = await checkbox.getAttribute('id');

  expect(id).toBeTruthy();
  await expect(label).toHaveAttribute('for', id ?? '');
  await expect(checkbox).not.toBeChecked();
  await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  await expect(checkbox).toHaveAccessibleDescription('Required');

  await label.click();
  await expect(checkbox).toBeChecked();
  await expect(output).toHaveText('Notifications: on · Terms: accepted');
  await expect(checkbox).not.toHaveAttribute('aria-invalid', 'true');
  await expect(checkbox).toHaveAccessibleDescription('Accepted');

  await checkbox.press('Space');
  await expect(checkbox).not.toBeChecked();
  await expect(output).toHaveText('Notifications: on · Terms: pending');
  await expect(checkbox).toHaveAccessibleDescription('Required');

  await component.update({ externalConsent: true });
  await expect(checkbox).toBeChecked();
  await expect(output).toHaveText('Notifications: on · Terms: accepted');
  await component.update({ externalConsent: true, disabled: true });
  await expect(checkbox).toBeDisabled();
  await label.click({ force: true });
  await expect(checkbox).toBeChecked();
  await expect(output).toHaveText('Notifications: on · Terms: accepted');

  await component.update({ externalConsent: false, disabled: true });
  await expect(checkbox).not.toBeChecked();
  await expect(output).toHaveText('Notifications: on · Terms: pending');
  await component.update({ externalConsent: false });
  await expect(checkbox).toBeEnabled();
  await checkbox.press('Space');
  await expect(checkbox).toBeChecked();
  await expect(output).toHaveText('Notifications: on · Terms: accepted');
});
