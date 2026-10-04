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
  it('leaves options inactive until explicit initialization, then activates the selected option', () => {
    const { navigation, getActiveItem } = setupNavigation(undefined, 'beta');

    expect(getActiveItem()).toBeUndefined();

    navigation.activateInitialItem();

    expect(getActiveItem()).toBe('beta');
  });

  it.each([undefined, 'missing'])('activates the first option when the selected item is $selected', (selected) => {
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
  ])('activates $expected for initial position $position', ({ position, expected }) => {
    const { navigation, getActiveItem } = setupNavigation(undefined, 'beta');

    navigation.activateInitialItem(position);

    expect(getActiveItem()).toBe(expected);
  });

  it('wraps next initialization after the last option and previous initialization before the first', () => {
    const next = setupNavigation(undefined, 'gamma');
    const previous = setupNavigation(undefined, 'alpha');

    next.navigation.activateInitialItem('next');
    previous.navigation.activateInitialItem('previous');

    expect(next.getActiveItem()).toBe('alpha');
    expect(previous.getActiveItem()).toBe('gamma');
  });

  it('distinguishes next from last when the first option is selected', () => {
    const next = setupNavigation(undefined, 'alpha');
    const last = setupNavigation(undefined, 'alpha');

    next.navigation.activateInitialItem('next');
    last.navigation.activateInitialItem('last');

    expect(next.getActiveItem()).toBe('beta');
    expect(last.getActiveItem()).toBe('gamma');
  });

  it('uses the first and last options for next/previous when no item is selected', () => {
    const next = setupNavigation();
    const previous = setupNavigation();

    next.navigation.activateInitialItem('next');
    previous.navigation.activateInitialItem('previous');

    expect(next.getActiveItem()).toBe('alpha');
    expect(previous.getActiveItem()).toBe('gamma');
  });

  it('moves next/previous and wraps at both list boundaries', () => {
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

  it('starts moving from the selected option when no active option is set', () => {
    const next = setupNavigation(undefined, 'beta');
    const previous = setupNavigation(undefined, 'beta');

    next.navigation.moveActiveItem(1);
    previous.navigation.moveActiveItem(-1);

    expect(next.getActiveItem()).toBe('gamma');
    expect(previous.getActiveItem()).toBe('alpha');
  });

  it('activates first/last directly and resets the active option for an invalid position', () => {
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

  it('stays on the only option when moving in either direction', () => {
    const { navigation, getActiveItem } = setupNavigation(['only']);

    navigation.activateInitialItem();
    navigation.moveActiveItem(1);
    expect(getActiveItem()).toBe('only');

    navigation.moveActiveItem(-1);
    expect(getActiveItem()).toBe('only');
  });

  it('leaves options inactive in an empty list for all public navigation methods', () => {
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

  it('restores the selected option when the active index is out of bounds after the list shrinks', async () => {
    const { items, navigation, getActiveItem } = setupNavigation(undefined, 'beta');

    navigation.activateLastItem();
    expect(getActiveItem()).toBe('gamma');

    items.value = ['alpha', 'beta'];
    await nextTick();

    expect(getActiveItem()).toBe('beta');
  });

  it('resets the active option when the list is cleared', async () => {
    const { items, navigation, getActiveItem } = setupNavigation();

    navigation.activateFirstItem();
    items.value = [];
    await nextTick();

    expect(getActiveItem()).toBeUndefined();

    items.value = ['one', 'two', 'three'];
    await nextTick();

    expect(getActiveItem()).toBeUndefined();
  });

  it('preserves the active position when replacing the list with one of the same length', async () => {
    const { items, navigation, getActiveItem } = setupNavigation();

    navigation.activateItem(1);
    items.value = ['one', 'two', 'three'];
    await nextTick();

    expect(getActiveItem()).toBe('two');
  });

  it('does not automatically activate an option when a previously empty list is populated', async () => {
    const { items, getActiveItem } = setupNavigation([]);

    items.value = ['alpha', 'beta'];
    await nextTick();

    expect(getActiveItem()).toBeUndefined();
  });

  it('uses an externally changed selected item on the next explicit initialization', () => {
    const { selectedItem, navigation, getActiveItem } = setupNavigation(undefined, 'alpha');

    navigation.activateInitialItem();
    selectedItem.value = 'gamma';

    expect(getActiveItem()).toBe('alpha');

    navigation.activateInitialItem();

    expect(getActiveItem()).toBe('gamma');
  });
});
