import type { Locator } from '@playwright/test';

export async function dispatchPaste(textarea: Locator, text: string): Promise<boolean> {
  return textarea.evaluate((element, pastedText) => {
    const browserWindow = element.ownerDocument.defaultView;

    if (browserWindow == null) {
      throw new Error('Textarea must belong to a browser document');
    }

    const clipboardData = new browserWindow.DataTransfer();

    clipboardData.setData('text/plain', pastedText);

    const event = new browserWindow.ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData });

    element.dispatchEvent(event);

    return event.defaultPrevented;
  }, text);
}
