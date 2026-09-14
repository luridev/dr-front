import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useDrSelectTriggerKeyboard } from '@/forms/components/DrSelect/composables/useDrSelectTriggerKeyboard/useDrSelectTriggerKeyboard';

function setupKeyboard(isOpen: boolean) {
  const popup = {
    isOpen: ref(isOpen),
    close: vi.fn(),
  };

  const navigation = {
    moveActiveItem: vi.fn(),
    activateFirstItem: vi.fn(),
    activateLastItem: vi.fn(),
  };

  const openOptions = vi.fn();
  const selectActiveItem = vi.fn();
  const handleKeydown = useDrSelectTriggerKeyboard({ popup, navigation, openOptions, selectActiveItem });

  function press(key: string) {
    const preventDefault = vi.fn();

    handleKeydown({ key, preventDefault } as unknown as KeyboardEvent);

    return preventDefault;
  }

  return { popup, navigation, openOptions, selectActiveItem, press };
}

describe('useDrSelectTriggerKeyboard', () => {
  it.each(['Enter', ' '])('открывает закрытый select по клавише %j', (key) => {
    const { openOptions, selectActiveItem, press } = setupKeyboard(false);

    const preventDefault = press(key);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(openOptions).toHaveBeenCalledOnce();
    expect(openOptions).toHaveBeenCalledWith();
    expect(selectActiveItem).not.toHaveBeenCalled();
  });

  it.each(['Enter', ' '])('выбирает active option в открытом select по клавише %j', (key) => {
    const { openOptions, selectActiveItem, press } = setupKeyboard(true);

    const preventDefault = press(key);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(selectActiveItem).toHaveBeenCalledOnce();
    expect(openOptions).not.toHaveBeenCalled();
  });

  it.each([
    { key: 'ArrowDown', initial: 'next' as const },
    { key: 'ArrowUp', initial: 'previous' as const },
    { key: 'Home', initial: 'first' as const },
    { key: 'End', initial: 'last' as const },
  ])('открывает закрытый select с initial=$initial по $key', ({ key, initial }) => {
    const { navigation, openOptions, press } = setupKeyboard(false);

    const preventDefault = press(key);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(openOptions).toHaveBeenCalledWith(initial);
    expect(navigation.moveActiveItem).not.toHaveBeenCalled();
    expect(navigation.activateFirstItem).not.toHaveBeenCalled();
    expect(navigation.activateLastItem).not.toHaveBeenCalled();
  });

  it.each([
    { key: 'ArrowDown', action: 'move', offset: 1 },
    { key: 'ArrowUp', action: 'move', offset: -1 },
    { key: 'Home', action: 'first' },
    { key: 'End', action: 'last' },
  ] as const)('выполняет navigation action $action по $key в открытом select', ({ key, action, offset }) => {
    const { navigation, openOptions, press } = setupKeyboard(true);

    const preventDefault = press(key);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(openOptions).not.toHaveBeenCalled();

    if (action === 'move') {
      expect(navigation.moveActiveItem).toHaveBeenCalledWith(offset);
      expect(navigation.activateFirstItem).not.toHaveBeenCalled();
      expect(navigation.activateLastItem).not.toHaveBeenCalled();
    } else if (action === 'first') {
      expect(navigation.activateFirstItem).toHaveBeenCalledOnce();
      expect(navigation.moveActiveItem).not.toHaveBeenCalled();
      expect(navigation.activateLastItem).not.toHaveBeenCalled();
    } else {
      expect(navigation.activateLastItem).toHaveBeenCalledOnce();
      expect(navigation.moveActiveItem).not.toHaveBeenCalled();
      expect(navigation.activateFirstItem).not.toHaveBeenCalled();
    }
  });

  it.each([false, true])('закрывает select по Tab при isOpen=$isOpen без preventDefault', (isOpen) => {
    const { popup, press } = setupKeyboard(isOpen);

    const preventDefault = press('Tab');

    expect(preventDefault).not.toHaveBeenCalled();
    expect(popup.close).toHaveBeenCalledOnce();
  });

  it('игнорирует нерелевантную клавишу без callbacks и preventDefault', () => {
    const { popup, navigation, openOptions, selectActiveItem, press } = setupKeyboard(true);

    const preventDefault = press('PageDown');

    expect(preventDefault).not.toHaveBeenCalled();
    expect(popup.close).not.toHaveBeenCalled();
    expect(openOptions).not.toHaveBeenCalled();
    expect(selectActiveItem).not.toHaveBeenCalled();
    expect(navigation.moveActiveItem).not.toHaveBeenCalled();
    expect(navigation.activateFirstItem).not.toHaveBeenCalled();
    expect(navigation.activateLastItem).not.toHaveBeenCalled();
  });
});
