import { expect, test } from '~/tests/playwright/fixtures';
import type {
  DrInputNativeAttributesField,
  DrInputNativeAttributesFocus,
} from '@/forms/components/DrInput/DrInputNativeAttributes/types.support';

const storyId = 'forms/components/DrInput/DrInputNativeAttributes/DrInputNativeAttributes';
const fields = ['plain', 'masked', 'number', 'date', 'time'] as const;
const defaultInputModes = { plain: undefined, masked: 'text', number: 'numeric', date: 'text', time: 'numeric' };

test('native attribute overrides reach all wrappers and restore editor and spellCheck defaults when omitted', async ({ mount }) => {
  const root = await mount(storyId);

  for (const overrideAttrs of [false, true, false]) {
    await root.update({ overrideAttrs });

    for (const field of fields) {
      const control = root.locator(`.DrInputNativeAttributes__${field}`);
      const input = control.locator('input');
      const expectedMode = overrideAttrs ? 'tel' : defaultInputModes[field];

      const expectedAutocomplete = overrideAttrs
        ? 'section-checkout shipping tel'
        : field === 'plain' || field === 'masked' ? undefined : 'off';

      for (const [attribute, value] of [
        ['inputmode', expectedMode],
        ['autocomplete', expectedAutocomplete],
        ['enterkeyhint', overrideAttrs ? 'send' : undefined],
      ] as const) {
        if (value === undefined) {
          await expect(input).not.toHaveAttribute(attribute);
        } else {
          await expect(input).toHaveAttribute(attribute, value);
        }
      }

      if (field !== 'plain' && field !== 'masked') {
        continue;
      }

      for (const [attribute, value] of [
        ['spellcheck', 'false'], ['autocapitalize', 'characters'], ['autocorrect', 'off'],
      ] as const) {
        if (overrideAttrs) {
          await expect(input).toHaveAttribute(attribute, value);
        } else {
          await expect(input).not.toHaveAttribute(attribute);
        }
      }
    }
  }
});

test('Enter submits current canonical models once from each editor without blur', async ({ mount }) => {
  const root = await mount(storyId, { overrideAttrs: true });

  const expected = {
    plain: 'Initial', masked: '123456', number: 1234, date: '2026-10-27', time: '13:45:00',
  };

  const edits: Array<{ field: DrInputNativeAttributesField; text: string; value: string | number }> = [
    { field: 'plain', text: 'Changed', value: 'Changed' },
    { field: 'masked', text: '654321', value: '654321' },
    { field: 'number', text: '2345', value: 2345 },
    { field: 'date', text: '10/28/2026', value: '2026-10-28' },
    { field: 'time', text: '02:30', value: '14:30:00' },
  ];

  for (const [index, { field, text, value }] of edits.entries()) {
    const input = root.locator(`.DrInputNativeAttributes__${field} input`);
    await input.fill(text);
    Object.assign(expected, { [field]: value });
    await input.press('Enter');
    await expect(root.getByTestId('submissions')).toHaveText(String(index + 1));
    await expect(root.getByTestId('last-submission')).toHaveText(JSON.stringify(expected));
  }
});

test('focus emits the original native event once for inputs and ignores auxiliary buttons', async ({ mount }) => {
  const root = await mount(storyId);
  const events: Array<DrInputNativeAttributesFocus> = [];

  for (const field of fields) {
    const control = root.locator(`.DrInputNativeAttributes__${field}`);
    await control.locator('input').focus();
    events.push({ field, native: true, fromInput: true });
    await expect(root.getByTestId('focus-events')).toHaveText(JSON.stringify(events));

    for (const button of await control.getByRole('button').all()) {
      await button.focus();
      await expect(root.getByTestId('focus-events')).toHaveText(JSON.stringify(events));
    }
  }
});
