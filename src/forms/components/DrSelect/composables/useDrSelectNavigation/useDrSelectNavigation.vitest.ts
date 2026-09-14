import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { useDrSelectNavigation } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/useDrSelectNavigation';
import { createTestEffectScopeCollector } from '~/tests/vitest/lib/createTestEffectScopeCollector/createTestEffectScopeCollector';

const scopes = createTestEffectScopeCollector();

function setupNavigation(initialItems: Array<string> = ['alpha', 'beta', 'gamma'], initialSelected?: string) {
  const items = ref(initialItems);
  const selectedItem = ref(initialSelected);

  const navigation = scopes.run(() =>
    useDrSelectNavigation({
      getItems: () => items.value,
      getSelectedItem: () => selectedItem.value,
    }),
  );

  const getActiveItem = () => items.value[navigation.activeIndex.value];

  return { items, selectedItem, navigation, getActiveItem };
}

describe('useDrSelectNavigation', () => {
  it('не активирует option до явной инициализации и затем выбирает selected option', () => {
    const { navigation, getActiveItem } = setupNavigation(undefined, 'beta');

    expect(getActiveItem()).toBeUndefined();

    navigation.activateInitialItem();

    expect(getActiveItem()).toBe('beta');
  });

  it.each([undefined, 'missing'])('активирует первую option, когда selected item равен $selected', (selected) => {
    const { navigation, getActiveItem } = setupNavigation(undefined, selected);

    navigation.activateInitialItem();

    expect(getActiveItem()).toBe('alpha');
  });

  it.each([
    { position: 'selected' as const, expected: 'beta' },
    { position: 'first' as const, expected: 'alpha' },
    { position: 'last' as const, expected: 'gamma' },
    { position: 'next' as const, expected: 'gamma' },
    { position: 'previous' as const, expected: 'alpha' },
  ])('активирует $expected для initial position $position', ({ position, expected }) => {
    const { navigation, getActiveItem } = setupNavigation(undefined, 'beta');

    navigation.activateInitialItem(position);

    expect(getActiveItem()).toBe(expected);
  });

  it('циклически инициализирует next после последней и previous перед первой option', () => {
    const next = setupNavigation(undefined, 'gamma');
    const previous = setupNavigation(undefined, 'alpha');

    next.navigation.activateInitialItem('next');
    previous.navigation.activateInitialItem('previous');

    expect(next.getActiveItem()).toBe('alpha');
    expect(previous.getActiveItem()).toBe('gamma');
  });

  it('различает next и last при selected первой option', () => {
    const next = setupNavigation(undefined, 'alpha');
    const last = setupNavigation(undefined, 'alpha');

    next.navigation.activateInitialItem('next');
    last.navigation.activateInitialItem('last');

    expect(next.getActiveItem()).toBe('beta');
    expect(last.getActiveItem()).toBe('gamma');
  });

  it('использует первую и последнюю option для next/previous без selected item', () => {
    const next = setupNavigation();
    const previous = setupNavigation();

    next.navigation.activateInitialItem('next');
    previous.navigation.activateInitialItem('previous');

    expect(next.getActiveItem()).toBe('alpha');
    expect(previous.getActiveItem()).toBe('gamma');
  });

  it('переходит next/previous и циклически проходит обе границы списка', () => {
    const { navigation, getActiveItem } = setupNavigation();

    navigation.activateFirstItem();
    expect(getActiveItem()).toBe('alpha');

    navigation.moveActiveItem(-1);
    expect(getActiveItem()).toBe('gamma');

    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBe('alpha');

    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBe('beta');

    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBe('gamma');

    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBe('alpha');
  });

  it('начинает move от selected option, если active option ещё не задана', () => {
    const next = setupNavigation(undefined, 'beta');
    const previous = setupNavigation(undefined, 'beta');

    next.navigation.moveActiveItem(1);
    previous.navigation.moveActiveItem(-1);

    expect(next.getActiveItem()).toBe('gamma');
    expect(previous.getActiveItem()).toBe('alpha');
  });

  it('активирует first/last напрямую и сбрасывает active option для недопустимой позиции', () => {
    const { navigation, getActiveItem } = setupNavigation();

    navigation.activateLastItem();
    expect(getActiveItem()).toBe('gamma');

    navigation.activateFirstItem();
    expect(getActiveItem()).toBe('alpha');

    navigation.activateItem(1);
    expect(getActiveItem()).toBe('beta');

    navigation.activateItem(-1);
    expect(getActiveItem()).toBeUndefined();

    navigation.activateItem(3);
    expect(getActiveItem()).toBeUndefined();

    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBe('alpha');
  });

  it('остаётся на singleton option при движении в обе стороны', () => {
    const { navigation, getActiveItem } = setupNavigation(['only']);

    navigation.activateInitialItem();
    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBe('only');

    navigation.moveActiveItem(-1);
    expect(getActiveItem()).toBe('only');
  });

  it('не активирует option для пустого списка ни одним публичным переходом', () => {
    const { navigation, getActiveItem } = setupNavigation([]);

    navigation.activateInitialItem();
    expect(getActiveItem()).toBeUndefined();

    navigation.activateFirstItem();
    expect(getActiveItem()).toBeUndefined();

    navigation.activateLastItem();
    expect(getActiveItem()).toBeUndefined();

    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBeUndefined();
  });

  it('после сокращения списка восстанавливает selected option, если active вышла за границу', async () => {
    const { items, navigation, getActiveItem } = setupNavigation(undefined, 'beta');

    navigation.activateLastItem();
    expect(getActiveItem()).toBe('gamma');

    items.value = ['alpha', 'beta'];
    await nextTick();

    expect(getActiveItem()).toBe('beta');
  });

  it('сбрасывает active option при очистке списка', async () => {
    const { items, navigation, getActiveItem } = setupNavigation();

    navigation.activateFirstItem();
    items.value = [];
    await nextTick();

    expect(getActiveItem()).toBeUndefined();

    items.value = ['one', 'two', 'three'];
    await nextTick();

    expect(getActiveItem()).toBeUndefined();
  });

  it('сохраняет active позицию при замене списка той же длины', async () => {
    const { items, navigation, getActiveItem } = setupNavigation();

    navigation.activateItem(1);
    items.value = ['one', 'two', 'three'];
    await nextTick();

    expect(getActiveItem()).toBe('two');
  });

  it('не активирует option автоматически при заполнении ранее пустого списка', async () => {
    const { items, getActiveItem } = setupNavigation([]);

    items.value = ['alpha', 'beta'];
    await nextTick();

    expect(getActiveItem()).toBeUndefined();
  });

  it('учитывает внешнее изменение selected item при следующей явной инициализации', () => {
    const { selectedItem, navigation, getActiveItem } = setupNavigation(undefined, 'alpha');

    navigation.activateInitialItem();
    selectedItem.value = 'gamma';

    expect(getActiveItem()).toBe('alpha');

    navigation.activateInitialItem();

    expect(getActiveItem()).toBe('gamma');
  });
});
