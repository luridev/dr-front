import type { Locator } from '@playwright/test';

export function readFocusRing(indicator: Locator) {
  return indicator.evaluate((element) => {
    const style = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    const width = Number.parseFloat(style.outlineWidth);
    const offset = Number.parseFloat(style.outlineOffset);
    const outset = width + offset;
    const clearances: Array<number> = [];

    for (let parent = element.parentElement; parent != null; parent = parent.parentElement) {
      const parentStyle = getComputedStyle(parent);
      const clip = parent.getBoundingClientRect();

      if (/(hidden|clip|auto|scroll)/.test(parentStyle.overflowX)) {
        clearances.push(
          bounds.left - outset - clip.left - Number.parseFloat(parentStyle.borderLeftWidth),
          clip.right - Number.parseFloat(parentStyle.borderRightWidth) - bounds.right - outset,
        );
      }

      if (/(hidden|clip|auto|scroll)/.test(parentStyle.overflowY)) {
        clearances.push(
          bounds.top - outset - clip.top - Number.parseFloat(parentStyle.borderTopWidth),
          clip.bottom - Number.parseFloat(parentStyle.borderBottomWidth) - bounds.bottom - outset,
        );
      }
    }

    function channels(color: string) {
      return color.match(/[\d.]+/g)?.map(Number) ?? [];
    }

    const background = [0, 0, 0];
    let remaining = 1;

    const backgroundOwner = outset > 0 ? element.parentElement : element;

    for (let node: Element | null = backgroundOwner; node != null; node = node.parentElement) {
      const color = channels(getComputedStyle(node).backgroundColor);
      const alpha = color[3] ?? 1;

      for (let channel = 0; channel < 3; channel += 1) {
        background[channel] += color[channel] * alpha * remaining;
      }

      remaining *= 1 - alpha;
    }

    const backdrop = background.map((channel) => channel + 255 * remaining);
    const outline = channels(style.outlineColor);
    const alpha = outline[3] ?? 1;
    const foreground = backdrop.map((channel, index) => outline[index] * alpha + channel * (1 - alpha));

    function luminance(color: Array<number>) {
      const linear = color.map((channel) => {
        const value = channel / 255;

        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });

      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    }

    const light = Math.max(luminance(foreground), luminance(backdrop));
    const dark = Math.min(luminance(foreground), luminance(backdrop));

    return {
      style: style.outlineStyle,
      width,
      offset,
      color: style.outlineColor,
      contrast: (light + 0.05) / (dark + 0.05),
      clipClearance: clearances.length === 0 ? null : Math.min(...clearances),
      focused: element === document.activeElement,
      focusVisible: element.matches(':focus-visible'),
    };
  });
}

export function readFieldLayout(button: Locator) {
  return button.evaluate((element) => {
    const field = element.closest('.DrControl');

    if (field == null) {
      throw new Error('Expected a composed field.');
    }

    const root = field.getBoundingClientRect();

    return [field, ...field.querySelectorAll('input, button, .DrControl__label, .DrControl__message')].map((node) => {
      const bounds = node.getBoundingClientRect();

      return [bounds.x - root.x, bounds.y - root.y, bounds.width, bounds.height];
    });
  });
}
