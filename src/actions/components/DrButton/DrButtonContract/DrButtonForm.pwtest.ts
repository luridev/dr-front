import { expect, test } from '~/tests/playwright/fixtures';
import type { DrButtonFormProps } from '@/actions/components/DrButton/DrButtonContract/types.support';

const storyId = 'actions/components/DrButton/DrButtonContract/DrButtonForm';

for (const outside of [false, true]) {
  test(`DrButton submits ${outside ? 'an external' : 'its ancestor'} form once on Enter and click`, async ({ mount }) => {
    const props: DrButtonFormProps = { outside };
    const component = await mount(storyId, props);
    const button = component.getByRole('button', { name: 'Submit', exact: true });

    await component.getByRole('textbox', { name: 'First field', exact: true }).press('Enter');
    await expect(component.getByTestId('clicks')).toHaveText('1');
    await expect(component.getByTestId('submissions')).toHaveText('1');
    await button.click();
    await expect(component.getByTestId('clicks')).toHaveText('2');
    await expect(component.getByTestId('submissions')).toHaveText('2');
  });
}

test('DrButton disabled and loading states block implicit submission of its external form', async ({ mount }) => {
  const component = await mount(storyId, { outside: true });
  const field = component.getByRole('textbox', { name: 'First field', exact: true });

  for (const state of [{ disabled: true }, { loading: true }]) {
    await component.update({ outside: true, ...state });
    await field.press('Enter');
    await expect(component.getByTestId('clicks')).toHaveText('0');
    await expect(component.getByTestId('submissions')).toHaveText('0');
  }

  await component.update({ outside: true });
  await field.press('Enter');
  await expect(component.getByTestId('clicks')).toHaveText('1');
  await expect(component.getByTestId('submissions')).toHaveText('1');
});
