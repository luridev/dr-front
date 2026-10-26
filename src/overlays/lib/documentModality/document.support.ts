import { vi } from 'vitest';

export class FocusTarget {
  isConnected = true;
  inert = false;
  focus = vi.fn();

  closest(selector: string) {
    return selector === '[inert]' && this.inert ? this : null;
  }
}

export function createDocumentFixture() {
  function element() {
    const attributes = new Map<string, string>();
    const values = new Map<string, string>();
    const priorities = new Map<string, string>();

    return {
      getAttribute: (key: string) => attributes.get(key) ?? null,
      setAttribute: (key: string, value: unknown) => attributes.set(key, String(value)),
      removeAttribute: (key: string) => attributes.delete(key),
      style: {
        getPropertyValue: (key: string) => values.get(key) ?? '',
        getPropertyPriority: (key: string) => priorities.get(key) ?? '',
        setProperty(key: string, value: string, priority = '') {
          values.set(key, value);
          priorities.set(key, priority);
        },
        removeProperty(key: string) {
          values.delete(key);
          priorities.delete(key);
        },
      },
    };
  }

  const document = Object.assign(new EventTarget(), {
    body: Object.assign(new FocusTarget(), element()),
    documentElement: Object.assign(new FocusTarget(), element()),
    activeElement: null,
    defaultView: { HTMLElement: FocusTarget },
  }) as unknown as Document;

  const addListener = vi.spyOn(document, 'addEventListener');
  const removeListener = vi.spyOn(document, 'removeEventListener');
  const background = () => Object.assign(element(), { ownerDocument: document }) as unknown as HTMLElement;

  function keydown(key = 'Escape', prevented = false) {
    const event = Object.assign(new Event('keydown', { cancelable: true }), { key });

    if (prevented) {
      event.preventDefault();
    }

    document.dispatchEvent(event);

    return event;
  }

  function focus(target: FocusTarget | Element | null) {
    Object.defineProperty(document, 'activeElement', { configurable: true, value: target });
  }

  return { document, background, keydown, focus, addListener, removeListener };
}
