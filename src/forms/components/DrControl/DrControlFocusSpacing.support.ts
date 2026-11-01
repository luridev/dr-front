import type { Locator } from '@playwright/test';

export function getControlGeometry(control: Locator) {
  return control.evaluate((element) => {
    const root = element.getBoundingClientRect();
    const label = element.querySelector(':scope > .DrControl__label');
    const surface = element.querySelector(':scope > .DrControl__control');
    const message = element.querySelector(':scope > .DrControl__message');

    if (label == null || surface == null) {
      throw new Error('Expected a labelled control surface.');
    }

    const labelBox = label.getBoundingClientRect();
    const surfaceBox = surface.getBoundingClientRect();
    const messageBox = message?.getBoundingClientRect();
    const style = getComputedStyle(surface);
    const rounded = (value: number) => Math.round(value * 100) / 100;

    const outset = style.outlineStyle === 'none'
      ? 0
      : Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);

    return {
      layout: {
        width: rounded(root.width),
        height: rounded(root.height),
        labelTop: rounded(labelBox.top - root.top),
        labelLeft: rounded(labelBox.left - root.left),
        surfaceTop: rounded(surfaceBox.top - root.top),
        surfaceLeft: rounded(surfaceBox.left - root.left),
        surfaceHeight: rounded(surfaceBox.height),
        messageTop: messageBox == null ? null : rounded(messageBox.top - root.top),
      },
      labelGap: surfaceBox.top - labelBox.bottom,
      leftGap: surfaceBox.left - labelBox.right,
      rightGap: labelBox.left - surfaceBox.right,
      bottomSpace: root.bottom - surfaceBox.bottom,
      labelClearance: surfaceBox.top - outset - labelBox.bottom,
      messageClearance: messageBox == null ? null : messageBox.top - surfaceBox.bottom - outset,
      outlineStyle: style.outlineStyle,
    };
  });
}
