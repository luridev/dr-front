import type { Locator } from '@playwright/test';

export function getInput(component: Locator, name: string): Locator {
  return component.locator(`.DrInputMasking__${name} > [data-dr-focus-surface] input`).first();
}

export async function selectInputRange(input: Locator, from: number, to = from): Promise<void> {
  await input.focus();

  await input.evaluate((element: HTMLInputElement, range) => {
    element.setSelectionRange(range.from, range.to);
  }, { from, to });
}

export function readSelection(input: Locator): Promise<Array<number | null>> {
  return input.evaluate((element: HTMLInputElement) => [element.selectionStart, element.selectionEnd]);
}

export async function replaceInput(input: Locator, text: string): Promise<void> {
  await input.fill('');
  await input.pressSequentially(text);
}

export async function pasteInput(input: Locator, text: string): Promise<void> {
  await input.evaluate((element: HTMLInputElement, pastedText) => {
    const data = new DataTransfer();

    data.setData('text/plain', pastedText);

    const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true });

    // Firefox does not preserve clipboardData supplied to the constructor.
    if (event.clipboardData !== data) {
      Object.defineProperty(event, 'clipboardData', { value: data });
    }

    if (!element.dispatchEvent(event)) {
      return;
    }

    const shouldInsert = element.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertFromPaste',
      data: pastedText,
      dataTransfer: data,
      bubbles: true,
      cancelable: true,
    }));

    if (shouldInsert) {
      element.setRangeText(pastedText, element.selectionStart ?? 0, element.selectionEnd ?? 0, 'end');
      element.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', data: pastedText, bubbles: true }));
    }
  }, text);
}
