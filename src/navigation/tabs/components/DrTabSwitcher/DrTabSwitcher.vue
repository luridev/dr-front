<script setup lang="ts" generic="T extends string">
import { computed, nextTick } from 'vue';
import { getTabId } from '@/navigation/tabs/lib/getTabId/getTabId';
import { getTabPanelId } from '@/navigation/tabs/lib/getTabPanelId/getTabPanelId';
import type { ComponentPublicInstance } from 'vue';
import type {
  DrTabSwitcherOrientation,
  DrTabSwitcherProps,
} from '@/navigation/tabs/components/DrTabSwitcher/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrTabSwitcherProps<T>>(), {
  orientation: 'horizontal',
});

const model = defineModel<T>({ required: true });

const orientationClasses = {
  horizontal: 'DrTabSwitcher_horizontal',
  vertical: 'DrTabSwitcher_vertical',
} as const satisfies Record<DrTabSwitcherOrientation, string>;

const tabButtonRefs = new Map<T, HTMLButtonElement>();

const rootAriaOrientation = computed(() => (props.orientation === 'vertical' ? 'vertical' : undefined));

const selectedIndex = computed(() => {
  const index = getCurrentIndex();

  return index >= 0 ? index : 0;
});

const tabItems = computed(() =>
  props.items.map((item, index) => {
    const selected = isSelected(item);
    const focusable = index === selectedIndex.value;

    return {
      item,
      index,
      id: getTabId(props.id, item),
      panelId: getTabPanelId(props.id, item),
      selected,
      tabindex: focusable ? 0 : -1,
      classes: selected ? ['DrTabSwitcher__tab_selected'] : [],
    };
  }),
);

function isSelected(item: T) {
  return model.value === item;
}

function getCurrentIndex() {
  return props.items.findIndex((item) => isSelected(item));
}

function getLoopedIndex(index: number) {
  const itemsCount = props.items.length;

  if (itemsCount === 0) {
    return -1;
  }

  return (index + itemsCount) % itemsCount;
}

function setTabButtonRef(item: T, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLButtonElement) {
    tabButtonRefs.set(item, element);
  } else {
    tabButtonRefs.delete(item);
  }
}

function activateTabAtIndex(index: number) {
  if (index < 0 || index >= props.items.length) {
    return;
  }

  const item = props.items[index];

  model.value = item;

  void nextTick(() => {
    tabButtonRefs.get(item)?.focus();
  });
}

function activateRelativeTab(index: number, offset: number) {
  activateTabAtIndex(getLoopedIndex(index + offset));
}

function handleTabClick(item: T) {
  model.value = item;
}

function handleKeydown(event: KeyboardEvent, index: number) {
  switch (event.key) {
    case 'Home':
      event.preventDefault();
      activateTabAtIndex(0);

      return;

    case 'End':
      event.preventDefault();
      activateTabAtIndex(props.items.length - 1);

      return;
  }

  if (props.orientation === 'horizontal') {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        activateRelativeTab(index, 1);

        return;

      case 'ArrowLeft':
        event.preventDefault();
        activateRelativeTab(index, -1);

        return;
    }

    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      activateRelativeTab(index, 1);

      return;

    case 'ArrowUp':
      event.preventDefault();
      activateRelativeTab(index, -1);

      return;
  }
}
</script>

<template>
  <div
    :id="props.id"
    class="DrTabSwitcher"
    :class="[orientationClasses[props.orientation], $attrs.class]"
    role="tablist"
    :aria-label="props.aria.ariaLabel"
    :aria-orientation="rootAriaOrientation"
  >
    <button
      v-for="tab in tabItems"
      :id="tab.id"
      :key="tab.item"
      :ref="(element) => setTabButtonRef(tab.item, element)"
      class="DrTabSwitcher__tab"
      :class="tab.classes"
      type="button"
      role="tab"
      :aria-controls="tab.panelId"
      :aria-selected="tab.selected"
      :tabindex="tab.tabindex"
      @click="() => handleTabClick(tab.item)"
      @keydown="($event) => handleKeydown($event, tab.index)"
    >
      <slot
        name="item"
        :item="tab.item"
        :index="tab.index"
        :selected="tab.selected"
      ></slot>
    </button>
  </div>
</template>

<style scoped>
  .DrTabSwitcher {
    display: flex;
    max-width: 100%;
    min-width: 0;
    color: var(--dr-color-text-secondary);
  }

  .DrTabSwitcher_horizontal {
    flex-flow: row nowrap;
    overflow: auto hidden;
  }

  .DrTabSwitcher_vertical {
    flex-direction: column;
    align-items: stretch;
  }

  .DrTabSwitcher__tab {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: var(--dr-space-small) var(--dr-space-large);
    border: 0;
    border-bottom: 2px solid var(--dr-color-border-secondary);
    background: transparent;
    color: inherit;
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
    transition:
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .DrTabSwitcher__tab:hover {
    color: var(--dr-color-text-primary);
  }

  .DrTabSwitcher__tab:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: -2px;
  }

  .DrTabSwitcher__tab_selected {
    border-color: var(--dr-color-border-accent);
    color: var(--dr-color-text-primary);
  }

  .DrTabSwitcher_vertical .DrTabSwitcher__tab {
    justify-content: flex-start;
    width: 100%;
    border-bottom: 0;
    border-left: 2px solid var(--dr-color-border-secondary);
    text-align: left;
  }

  .DrTabSwitcher_vertical .DrTabSwitcher__tab_selected {
    border-left-color: var(--dr-color-border-accent);
  }
</style>
