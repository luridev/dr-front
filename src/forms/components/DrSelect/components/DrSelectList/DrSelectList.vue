<script setup lang="ts" generic="T">
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import { useCollectionKeys } from '@/collections/composables/useCollectionKeys/useCollectionKeys';
import { useDrSelectNavigation } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/useDrSelectNavigation';
import DrCheckIcon from '@/icons/components/DrCheckIcon/DrCheckIcon.generated.vue';
import type {
  DrSelectListEmits,
  DrSelectListProps,
  DrSelectListSlots,
} from '@/forms/components/DrSelect/components/DrSelectList/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrSelectListProps<T>>(), {
  tabindex: -1,
});

const emit = defineEmits<DrSelectListEmits<T>>();
defineSlots<DrSelectListSlots<T>>();

const optionElements = useTemplateRef<Array<HTMLButtonElement>>('optionElements');
const getItemKey = useCollectionKeys(() => props.items);

const navigation = useDrSelectNavigation({
  getItems: () => props.items,
  getSelectedItem: () => props.selectedItem,
});

const options = computed(() =>
  props.items.map((item, index) => {
    const selected = props.hasSelection && props.selectedItem === item;
    const active = navigation.activeIndex.value === index;

    return {
      item,
      index,
      id: getOptionId(index),
      key: getItemKey(item),
      selected,
      active,
      classes: {
        DrSelectList__option_active: active,
        DrSelectList__option_selected: selected,
      },
    };
  }),
);

const activeDescendant = computed(() => {
  const index = navigation.activeIndex.value;

  return index < 0 || index >= props.items.length ? undefined : getOptionId(index);
});

function getOptionId(index: number) {
  return `${props.id}-option-${index}`;
}

function activateItem(index: number) {
  navigation.activateItem(index);
  emit('activate', navigation.activeIndex.value);
}

function activateFirstItem() {
  navigation.activateFirstItem();
  emit('activate', navigation.activeIndex.value);
}

function activateLastItem() {
  navigation.activateLastItem();
  emit('activate', navigation.activeIndex.value);
}

function moveActiveItem(offset: number) {
  navigation.moveActiveItem(offset);
  emit('activate', navigation.activeIndex.value);
}

function selectItem(item: T) {
  emit('select', item);
}

function selectActiveItem() {
  const item = props.items[navigation.activeIndex.value];

  if (item !== undefined) {
    selectItem(item);
  }
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActiveItem(1);

      return;

    case 'ArrowUp':
      event.preventDefault();
      moveActiveItem(-1);

      return;

    case 'Home':
      event.preventDefault();
      activateFirstItem();

      return;

    case 'End':
      event.preventDefault();
      activateLastItem();

      return;

    case 'Enter':
    case ' ':
      event.preventDefault();
      selectActiveItem();
  }
}

watch(
  navigation.activeIndex,
  async (index) => {
    await nextTick();
    optionElements.value?.[index]?.scrollIntoView({ block: 'nearest' });
  },
  {
    immediate: true,
  },
);

watch(
  () => props.activeIndex,
  (activeIndex) => {
    if (activeIndex == null) {
      navigation.activateInitialItem();
    } else {
      navigation.activateItem(activeIndex);
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- Typed -1/0 tabindex. -->
  <div
    :id="props.id"
    class="DrSelectList"
    :class="$attrs.class"
    role="listbox"
    :tabindex="props.tabindex"
    :aria-label="props.accessibleLabel"
    :aria-activedescendant="activeDescendant"
    data-dr-dialog-initial-focus
    @keydown="handleKeydown"
  >
    <button
      v-for="option in options"
      :id="option.id"
      :key="option.key"
      ref="optionElements"
      class="DrSelectList__option"
      :class="option.classes"
      type="button"
      role="option"
      tabindex="-1"
      :aria-selected="option.selected"
      @click="() => selectItem(option.item)"
      @pointermove="() => activateItem(option.index)"
    >
      <span
        class="DrSelectList__indicator"
        aria-hidden="true"
      >
        <DrCheckIcon
          v-if="option.selected"
          class="DrSelectList__check"
          :size="16"
        />
      </span>

      <span class="DrSelectList__optionLabel">
        <slot
          name="item"
          :item="option.item"
          :index="option.index"
          :selected="option.selected"
          :active="option.active"
        >
          {{ String(option.item) }}
        </slot>
      </span>
    </button>
  </div>
</template>

<style scoped>
  .DrSelectList {
    min-width: 100%;
    max-height: 20rem;
    padding: var(--dr-space-xsmall);
    overflow-y: auto;
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-surface);
    background: var(--dr-color-background-primary);
    color: var(--dr-color-text-primary);
    outline: none;
    box-shadow: var(--dr-select-list-box-shadow, none);
  }

  .DrSelectList:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: 2px;
  }

  .DrSelectList__option {
    display: grid;
    width: 100%;
    min-width: 0;
    min-height: 40px;
    padding: var(--dr-space-small) var(--dr-space-medium);
    border: 0;
    border-radius: var(--dr-border-radius-control);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    grid-template-columns: 16px minmax(0, 1fr);
    align-items: center;
    gap: var(--dr-space-medium);
  }

  .DrSelectList__option:hover,
  .DrSelectList__option_active {
    background: var(--dr-color-background-highlight);
  }

  .DrSelectList__option:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: -2px;
  }

  .DrSelectList__option_selected {
    font-weight: 600;
  }

  .DrSelectList__indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .DrSelectList__optionLabel {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .DrSelectList__check {
    color: var(--dr-color-text-secondary);
  }
</style>
