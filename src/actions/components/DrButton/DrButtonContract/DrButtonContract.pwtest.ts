import { expect, test } from '~/tests/playwright/fixtures';
import type { DrButtonContractProps } from '@/actions/components/DrButton/DrButtonContract/types.support';

const storyId = 'actions/components/DrButton/DrButtonContract/DrButtonContract';

test('DrButton сохраняет root class, explicit emits и native button props', async ({ mount }) => {
  const props: DrButtonContractProps = {};
  const component = await mount(storyId, props);
  const root = component.locator('.DrButtonRoot');
  const button = root.getByRole('button');

  await expect(root).toHaveClass(/DrButtonContract__incoming/);
  await expect(root).toHaveClass(/DrButtonContract__conditional/);
  await expect(button).not.toHaveClass(/DrButtonContract__/);
  await expect(button).toHaveAttribute('type', 'button');
  await expect(button).toHaveAttribute('id', 'contract-button');
  await expect(root).not.toHaveAttribute('id');

  for (const element of [root, button]) {
    for (const attribute of ['style', 'data-attrs-probe', 'aria-description', 'name']) {
      await expect(element).not.toHaveAttribute(attribute);
    }

    await element.dispatchEvent('mousedown');
  }

  await root.dispatchEvent('click');
  await root.dispatchEvent('pointerdown');
  await expect(component.getByTestId('clicks')).toHaveText('0');
  await expect(component.getByTestId('pointerdowns')).toHaveText('0');
  await button.click();
  await expect(component.getByTestId('clicks')).toHaveText('1');
  await expect(component.getByTestId('pointerdowns')).toHaveText('1');
  await expect(component.getByTestId('unexpected-events')).toHaveText('0');

  await component.update({ incomingClass: 'UpdatedClass', conditionalClass: false });
  await expect(root).toHaveClass(/UpdatedClass/);
  await expect(root).not.toHaveClass(/DrButtonContract__/);
  await expect(button).not.toHaveClass(/UpdatedClass/);
  await component.update({ incomingClass: '', conditionalClass: false });
  await expect(root).not.toHaveClass(/UpdatedClass|DrButtonContract__/);
  await expect(root).toHaveClass(/DrButtonRoot/);

  await component.update({ disabled: true });
  await expect(button).toBeDisabled();
  await expect(button).not.toHaveAttribute('aria-busy');
  await component.update({ loading: true });
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await component.update({});
  await expect(button).toBeEnabled();
  await expect(button).not.toHaveAttribute('aria-busy');
});
