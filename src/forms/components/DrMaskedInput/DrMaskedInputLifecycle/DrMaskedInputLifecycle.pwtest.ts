import { readSelection, selectInputRange } from '@/forms/components/DrInput/DrInputMasking/playwright.support';
import { maskedInputLifecycleStoryId as storyId } from '@/forms/components/DrMaskedInput/DrMaskedInputLifecycle/config.support';
import { expect, test } from '~/tests/playwright/fixtures';

test('inline options preserve selection and undo/redo across parent echoes and rerenders', async ({ mount }) => {
  const root = await mount(storyId);
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await input.pressSequentially('1234');
  await selectInputRange(input, 1, 3);
  await root.getByRole('button', { name: 'Rerender 0' }).click();
  await expect(input).toHaveValue('123-4');
  await expect(input).toBeFocused();
  await expect.poll(() => readSelection(input)).toEqual([1, 3]);
  await expect(root.getByTestId('updates')).toHaveText('["1","12","123","1234"]');
  await expect(root.getByTestId('statuses')).toHaveText('["empty","incomplete"]');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('123');
  await root.getByRole('button', { name: 'Rerender 1' }).click();
  await input.press('ControlOrMeta+Shift+Z');
  await expect(input).toHaveValue('123-4');
  await expect(root.getByTestId('updates')).toHaveText('["1","12","123","1234","123","1234"]');
});

for (const [variant, entered, display, model] of [
  ['nested', 'AB12', 'AB-12', 'AB12'],
  ['exposed', '1234', '12:34', '34'],
] as const) {
  test(`${variant} retains live context with equivalent nested inline options`, async ({ mount }) => {
    const root = await mount(storyId, { variant });
    const input = root.getByRole('textbox', { name: 'Lifecycle code' });
    await input.fill(entered);
    await root.getByRole('button', { name: 'Rerender 0' }).click();
    await expect(input).toHaveValue(display);
    await expect(root.getByTestId('model')).toHaveText(model);
    await expect(root.getByTestId('updates')).toHaveText(JSON.stringify([model]));
    await expect(root.getByTestId('statuses')).toHaveText('["empty","valid"]');
  });
}

test('inline prepareChar does not reprocess accepted values on parent echoes', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'prepared' });
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await input.fill('ab');
  await expect(input).toHaveValue('bc');
  await expect(root.getByTestId('updates')).toHaveText('["bc"]');
  const prepareCalls = await root.getByTestId('prepare-calls').textContent();
  await root.getByRole('button', { name: 'Rerender 0' }).click();
  await expect(input).toHaveValue('bc');
  await expect(root.getByTestId('prepare-calls')).toHaveText(prepareCalls ?? '');
  await expect(root.getByTestId('updates')).toHaveText('["bc"]');
  await expect(root.getByTestId('statuses')).toHaveText('["empty","incomplete"]');
});

test('external values update an inline exposed block without losing its other blocks', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'exposed' });
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await input.fill('1234');
  await root.update({ variant: 'exposed', externalValue: '567' });
  await expect(input).toHaveValue('12:56');
  await expect(root.getByTestId('model')).toHaveText('56');
  await expect(root.getByTestId('updates')).toHaveText('["34","56"]');
  await expect(root.getByTestId('statuses')).toHaveText('["empty","valid"]');
});

for (const button of ['Change reactive pattern', 'Change reactive block']) {
  test(`${button} starts a new history at the accepted value`, async ({ mount }) => {
    const root = await mount(storyId, { variant: 'reactive' });
    const input = root.getByRole('textbox', { name: 'Lifecycle code' });
    await input.pressSequentially('1234');
    await expect(input).toHaveValue('12-34');
    await root.getByRole('button', { name: button }).click();
    await expect(input).toHaveValue('1234');
    await expect(input).toBeFocused();
    await input.press('ControlOrMeta+Z');
    await expect(input).toHaveValue('1234');
    await expect(root.getByTestId('updates')).toHaveText('["1","12","123","1234"]');
    await input.press('Backspace');
    await expect(input).toHaveValue('123');
    await input.press('ControlOrMeta+Z');
    await expect(input).toHaveValue('1234');
  });
}

test('reactive removal resets omitted options and a dynamic array mutation recompiles branches', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'number', externalValue: '1' });
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await expect(input).toHaveValue('5');
  await root.getByRole('button', { name: 'Remove minimum' }).click();
  await root.update({ variant: 'number', externalValue: '2' });
  await expect(input).toHaveValue('2');
  await expect(root.getByTestId('updates')).toHaveText('["5"]');
  await root.update({ variant: 'dynamic', externalValue: '12' });
  await expect(input).toHaveValue('12');
  await root.getByRole('button', { name: 'Add dynamic branch' }).click();
  await input.press('End');
  await input.press('3');
  await expect(input).toHaveValue('123');
  await expect(root.getByTestId('updates')).toHaveText('["5","123"]');
});

test('callback closures and removed validators use complete replacement options', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'replacement' });
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await root.getByRole('button', { name: 'Limit two' }).click();
  await input.fill('1234');
  await expect(input).toHaveValue('12');
  await root.getByRole('button', { name: 'Limit four' }).click();
  await input.fill('1234');
  await expect(input).toHaveValue('1234');
  await root.getByRole('button', { name: 'Limit two' }).click();
  await expect(input).toHaveValue('12');
  await root.getByRole('button', { name: 'Replace pattern' }).click();
  await input.fill('1234');
  await expect(input).toHaveValue('1234');
  await expect(root.getByTestId('updates')).toHaveText('["12","1234","12","1234"]');
});

test('type and simultaneous model/config changes normalize once and replace the undo baseline', async ({ mount }) => {
  const root = await mount(storyId, { variant: 'replacement' });
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await input.fill('1234');
  await root.getByRole('button', { name: 'Replace number' }).click();
  await expect(input).toHaveValue('12');
  await expect(input).toBeFocused();
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('12');
  await root.getByRole('button', { name: 'Replace options and value' }).click();
  await expect(input).toHaveValue('98/76');
  await expect(root.getByTestId('model')).toHaveText('9876');
  await expect(root.getByTestId('updates')).toHaveText('["1234","12","9876"]');
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('98/76');
  await expect(root.getByTestId('updates')).toHaveText('["1234","12","9876"]');
});

test('equivalent options preserve composition until the committed input arrives', async ({ mount }) => {
  const root = await mount(storyId);
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await input.focus();

  await input.evaluate((element: HTMLInputElement) => {
    element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    element.value = 'に';
    element.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true, data: 'に' }));
  });

  await root.getByRole('button', { name: 'Rerender 0' }).click();
  await expect(input).toHaveValue('に');
  await expect(input).toBeFocused();
  await expect(root.getByTestId('updates')).toHaveText('[]');

  await input.evaluate((element: HTMLInputElement) => {
    element.value = '1234';
    element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '1234' }));
  });

  await expect(input).toHaveValue('123-4');
  await expect(root.getByTestId('updates')).toHaveText('["1234"]');
});

test('readonly/disabled reactivation and unmount leave no stale input listeners', async ({ mount }) => {
  const root = await mount(storyId);
  const input = root.getByRole('textbox', { name: 'Lifecycle code' });
  await input.fill('1234');
  await root.update({ readonly: true, externalValue: '5678' });
  await input.press('ControlOrMeta+Z');
  await expect(input).toHaveValue('567-8');
  await root.update({ disabled: true, externalValue: '12' });
  await expect(input).toBeDisabled();
  await root.update({ externalValue: '12' });
  await input.press('End');
  await input.press('3');
  await expect(input).toHaveValue('123');
  await expect(root.getByTestId('updates')).toHaveText('["1234","123"]');
  const detached = await input.elementHandle();
  await root.update({ visible: false });
  await expect(input).toHaveCount(0);

  const detachedValue = await detached.evaluate((element: HTMLInputElement) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    element.value = 'abc1234';
    element.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'abc1234' }));

    return element.value;
  });

  expect(detachedValue).toBe('abc1234');
  await expect(root.getByTestId('updates')).toHaveText('["1234","123"]');
  await root.update({ visible: true });
  await input.fill('9876');
  await expect(root.getByTestId('updates')).toHaveText('["1234","123","9876"]');
  await detached.dispose();
});
