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
      const [red, green, blue, alpha = 1] = color.match(/[\d.]+/g)?.map(Number) ?? [];

      if (red === undefined || green === undefined || blue === undefined) {
        throw new Error(`Expected an RGB color: ${color}`);
      }

      return [red, green, blue, alpha] satisfies [number, number, number, number];
    }

    const rgb = [0, 1, 2] as const;
    const background: [number, number, number] = [0, 0, 0];
    let remaining = 1;

    const backgroundOwner = outset > 0 ? element.parentElement : element;

    for (let node: Element | null = backgroundOwner; node != null; node = node.parentElement) {
      const color = channels(getComputedStyle(node).backgroundColor);
      const alpha = color[3];

      for (const channel of rgb) {
        background[channel] += color[channel] * alpha * remaining;
      }

      remaining *= 1 - alpha;
    }

    const outline = channels(style.outlineColor);
    const alpha = outline[3];
    const weights = [0.2126, 0.7152, 0.0722] as const;
    let backdropLuminance = 0;
    let foregroundLuminance = 0;

    function linearIntensity(channel: number) {
      const value = channel / 255;

      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }

    for (const channel of rgb) {
      const backdrop = background[channel] + 255 * remaining;
      const foreground = outline[channel] * alpha + backdrop * (1 - alpha);

      backdropLuminance += linearIntensity(backdrop) * weights[channel];
      foregroundLuminance += linearIntensity(foreground) * weights[channel];
    }

    const light = Math.max(foregroundLuminance, backdropLuminance);
    const dark = Math.min(foregroundLuminance, backdropLuminance);

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
