<script setup lang="ts" generic="T">
import { computed, nextTick, onMounted, ref, toRef, useId, useTemplateRef, watch } from 'vue';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import DrSelectList from '@/forms/components/DrSelect/components/DrSelectList/DrSelectList.vue';
import DrSelectTrigger from '@/forms/components/DrSelect/components/DrSelectTrigger/DrSelectTrigger.vue';
import { useDrSelectAria } from '@/forms/components/DrSelect/composables/useDrSelectAria/useDrSelectAria';
import { useDrSelectDesktopPopup } from '@/forms/components/DrSelect/composables/useDrSelectDesktopPopup/useDrSelectDesktopPopup';
import { useDrSelectNavigation } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/useDrSelectNavigation';
import { useDrSelectTriggerKeyboard } from '@/forms/components/DrSelect/composables/useDrSelectTriggerKeyboard/useDrSelectTriggerKeyboard';
import { defaultDrSelectDialogTitle, defaultDrSelectEmptyText } from '@/forms/components/DrSelect/config';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type {
  DrSelectListEmits,
  DrSelectListProps,
} from '@/forms/components/DrSelect/components/DrSelectList/types';
import type { DrSelectTriggerExposed } from '@/forms/components/DrSelect/components/DrSelectTrigger/types';
import type { DrSelectInitialActiveItem } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/types';
import type {
  DrSelectExposed,
  DrSelectItemSlotProps,
  DrSelectPresentation,
  DrSelectProps,
  DrSelectSlots,
} from '@/forms/components/DrSelect/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrSelectProps<T>>(), {
  disabled: false,
  state: 'normal',
  emptyText: defaultDrSelectEmptyText,
});

const model = defineModel<T>({ required: true });
const slots = defineSlots<DrSelectSlots<T>>();

const mobileMediaQuery = '(width <= 560px)';

const rootElement = useTemplateRef<HTMLElement>('rootElement');
const trigger = useTemplateRef<DrSelectTriggerExposed>('trigger');

const selectId = useId();
const desktopListboxId = `${selectId}-listbox`;
const mobileListboxId = `${selectId}-dialog-listbox`;

const items = toRef(props, 'items');

const navigation = useDrSelectNavigation({
  getItems: () => props.items,
  getSelectedItem: () => model.value,
});

const desktopPopup = useDrSelectDesktopPopup({
  rootElement,
});

const presentation = ref<DrSelectPresentation>('listbox');
const dialogInitialActiveIndex = ref<number>();

const hasSelection = computed(() => model.value !== undefined);
const selectedItem = computed(() => model.value);

const selectedIndex = computed(() => {
  const item = selectedItem.value;

  return item === undefined ? -1 : props.items.findIndex((candidate) => candidate === item);
});

const effectiveDisabled = computed(() => props.disabled || props.items.length === 0);
const placeholderText = computed(() => (props.items.length === 0 ? props.emptyText : props.placeholder));
const isPlaceholderVisible = computed(() => !hasSelection.value);

const accessibleLabel = computed(() => {
  if (isNonBlankString(props.label)) {
    return props.label;
  }

  if (isNonBlankString(props.placeholder)) {
    return props.placeholder;
  }

  return defaultDrSelectDialogTitle;
});

const selectedItemSlotProps = computed<DrSelectItemSlotProps<T> | undefined>(() => {
  const item = selectedItem.value;

  if (item === undefined) {
    return undefined;
  }

  return {
    item,
    index: selectedIndex.value,
    selected: true,
    active: desktopPopup.isOpen.value && selectedIndex.value === navigation.activeIndex.value,
  };
});

const {
  id: itemsDialogId,
  isOpen: isItemsDialogOpen,
  open: openItemsDialog,
  close: closeItemsDialog,
} = useDialog<DrSelectListProps<T>, DrSelectListEmits<T>>({
  title: accessibleLabel,
  component: DrSelectList,
  props: {
    id: mobileListboxId,
    tabindex: 0,
    items,
    selectedItem: model,
    hasSelection,
    activeIndex: dialogInitialActiveIndex,
    accessibleLabel,
  },
  slots: slots.item == null ? undefined : { item: slots.item },
});

const { triggerAria } = useDrSelectAria({
  presentation,
  isDesktopOpen: desktopPopup.isOpen,
  isDialogOpen: isItemsDialogOpen,
  desktopListboxId,
  dialogId: itemsDialogId,
  activeIndex: navigation.activeIndex,
  itemsCount: () => props.items.length,
});

function updatePresentation() {
  presentation.value = window.matchMedia(mobileMediaQuery).matches ? 'dialog' : 'listbox';
}

function openOptions(initialActiveItem: DrSelectInitialActiveItem = 'selected') {
  if (effectiveDisabled.value) {
    return;
  }

  updatePresentation();
  navigation.activateInitialItem(initialActiveItem);

  if (presentation.value === 'dialog') {
    dialogInitialActiveIndex.value = navigation.activeIndex.value;

    openItemsDialog({
      select: selectDialogItem,
    });

    return;
  }

  desktopPopup.open();
}

function selectDesktopItem(item: T) {
  model.value = item;
  desktopPopup.close();

  void nextTick(() => {
    trigger.value?.focus();
  });
}

function selectDialogItem(item: T) {
  model.value = item;
}

function selectActiveDesktopItem() {
  const item = props.items[navigation.activeIndex.value];

  if (item !== undefined) {
    selectDesktopItem(item);
  }
}

const handleTriggerKeydown = useDrSelectTriggerKeyboard({
  popup: desktopPopup,
  navigation,
  openOptions,
  selectActiveItem: selectActiveDesktopItem,
});

function handleTriggerClick() {
  if (desktopPopup.isOpen.value) {
    desktopPopup.close();
  } else {
    openOptions();
  }
}

function handleRootKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented || !desktopPopup.isOpen.value) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  desktopPopup.close();

  void nextTick(() => {
    trigger.value?.focus();
  });
}

function focus(options?: FocusOptions) {
  trigger.value?.focus(options);
}

watch(effectiveDisabled, (disabled) => {
  if (disabled) {
    desktopPopup.close();
    closeItemsDialog();
  }
});

onMounted(() => {
  updatePresentation();
});

defineExpose<DrSelectExposed>({
  focus,
});
</script>

<template>
  <DrControl
    class="DrSelect__control"
    :class="$attrs.class"
    :label-position="props.labelPosition"
    :disabled="effectiveDisabled"
    :state="props.state"
    :message="props.message"
    bordered
  >
    <template #label>
      <slot name="label">
        {{ props.label }}
      </slot>
    </template>

    <template #default="slotProps">
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- Delegated Escape. -->
      <div
        ref="rootElement"
        class="DrSelect"
        @keydown="handleRootKeydown"
      >
        <DrSelectTrigger
          :id="slotProps.id"
          ref="trigger"
          :disabled="slotProps.disabled"
          :is-placeholder="isPlaceholderVisible"
          :aria="triggerAria"
          :invalid="slotProps.state === 'error'"
          :described-by="slotProps.describedBy"
          @click="handleTriggerClick"
          @keydown="handleTriggerKeydown"
        >
          <template v-if="selectedItemSlotProps != null">
            <slot
              name="item"
              v-bind="selectedItemSlotProps"
            >
              {{ String(selectedItemSlotProps.item) }}
            </slot>
          </template>

          <template v-else>
            {{ placeholderText }}
          </template>
        </DrSelectTrigger>

        <div
          v-if="desktopPopup.isOpen.value"
          class="DrSelect__popup"
        >
          <DrSelectList
            :id="desktopListboxId"
            :items="props.items"
            :selected-item="selectedItem"
            :has-selection="hasSelection"
            :active-index="navigation.activeIndex.value"
            :accessible-label="accessibleLabel"
            @activate="navigation.activateItem"
            @select="selectDesktopItem"
          >
            <template
              v-if="slots.item != null"
              #item="itemSlotProps"
            >
              <slot
                name="item"
                v-bind="itemSlotProps"
              ></slot>
            </template>
          </DrSelectList>
        </div>
      </div>
    </template>
  </DrControl>
</template>

<style scoped>
  .DrSelect__control :deep(.DrControl__control_bordered) {
    overflow: visible;
  }

  .DrSelect {
    position: relative;
    align-self: stretch;
    width: 100%;
    min-width: 0;
  }

  .DrSelect__popup {
    position: absolute;
    z-index: var(--dr-layer-floating);
    top: calc(100% + var(--dr-space-xsmall));
    left: 0;
    width: max-content;
    min-width: 100%;
    max-width: min(40rem, calc(100vw - var(--dr-space-medium) * 2));
    border-radius: var(--dr-border-radius-surface);
    box-shadow: 0 var(--dr-space-small) var(--dr-space-large) rgb(0 0 0 / 18%);
  }
</style>
