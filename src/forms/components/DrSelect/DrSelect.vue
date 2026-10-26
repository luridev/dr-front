<script setup lang="ts" generic="T">
import { computed, nextTick, onMounted, ref, toRef, useId, useTemplateRef, watch } from 'vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import DrSelectList from '@/forms/components/DrSelect/components/DrSelectList/DrSelectList.vue';
import DrSelectTrigger from '@/forms/components/DrSelect/components/DrSelectTrigger/DrSelectTrigger.vue';
import { useDrSelectAria } from '@/forms/components/DrSelect/composables/useDrSelectAria/useDrSelectAria';
import { useDrSelectDesktopPopup } from '@/forms/components/DrSelect/composables/useDrSelectDesktopPopup/useDrSelectDesktopPopup';
import { useDrSelectNavigation } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/useDrSelectNavigation';
import { useDrSelectTriggerKeyboard } from '@/forms/components/DrSelect/composables/useDrSelectTriggerKeyboard/useDrSelectTriggerKeyboard';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type {
  DrSelectListEmits,
  DrSelectListExposed,
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
});

const model = defineModel<T>({ required: true });

const slots = defineSlots<DrSelectSlots<T>>();

const t = useDrTranslation();

const mobileMediaQuery = '(width <= 560px)';

const rootElement = useTemplateRef<HTMLElement>('rootElement');
const trigger = useTemplateRef<DrSelectTriggerExposed>('trigger');
const popupElement = useTemplateRef<HTMLElement>('popupElement');
const list = useTemplateRef<DrSelectListExposed>('list');
const reference = computed(() => trigger.value?.element ?? null);

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
  popupElement,
  reference,
});

watch(desktopPopup.isPositioned, async (positioned) => {
  if (positioned) {
    await nextTick();
    list.value?.ensureActiveVisible();
  }
});

watch(model, () => {
  navigation.activateInitialItem();
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
const placeholderText = computed(() => (props.items.length === 0 ? props.emptyText ?? t('select.empty') : props.placeholder));
const isPlaceholderVisible = computed(() => !hasSelection.value);

const accessibleLabel = computed(() => {
  if (isNonBlankString(props.label)) {
    return props.label;
  }

  if (isNonBlankString(props.placeholder)) {
    return props.placeholder;
  }

  return t('select.choose');
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
  canOpenModal,
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
  presentation.value = canOpenModal.value && window.matchMedia(mobileMediaQuery).matches ? 'dialog' : 'listbox';
}

function openOptions(initialActiveItem: DrSelectInitialActiveItem = 'selected') {
  if (effectiveDisabled.value || desktopPopup.isOpen.value || isItemsDialogOpen.value) {
    return;
  }

  updatePresentation();

  if (presentation.value === 'listbox' && !desktopPopup.ownerActive.value) {
    return;
  }

  navigation.activateInitialItem(initialActiveItem);

  if (presentation.value === 'dialog') {
    dialogInitialActiveIndex.value = navigation.activeIndex.value;

    openItemsDialog({
      select: selectDialogItem,
    }, { opener: reference.value });

    return;
  }

  reference.value?.focus({ preventScroll: true });
  desktopPopup.open();
}

function selectDesktopItem(item: T) {
  model.value = item;
  desktopPopup.close();
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

const triggerKeyboard = useDrSelectTriggerKeyboard({
  popup: desktopPopup,
  navigation,
  openOptions,
  selectActiveItem: selectActiveDesktopItem,
});

function handleTriggerKeydown(event: KeyboardEvent) {
  triggerKeyboard(event);

  if (event.key !== 'Escape' || event.defaultPrevented || !desktopPopup.isOpen.value) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  desktopPopup.close();
}

function handleTriggerClick() {
  if (desktopPopup.isOpen.value) {
    desktopPopup.close();
  } else {
    openOptions();
  }
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
      <div
        ref="rootElement"
        class="DrSelect"
        @focusout="desktopPopup.close"
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

        <Teleport
          v-if="desktopPopup.portalTarget.value != null"
          :to="desktopPopup.portalTarget.value"
        >
          <div
            v-if="desktopPopup.isOpen.value"
            ref="popupElement"
            class="DrSelect__popup"
            :style="[
              desktopPopup.floatingStyles.value,
              { visibility: desktopPopup.isPositioned.value ? 'visible' : 'hidden' },
            ]"
          >
            <DrSelectList
              :id="desktopListboxId"
              ref="list"
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
        </Teleport>
      </div>
    </template>
  </DrControl>
</template>

<style scoped>
  .DrSelect {
    align-self: stretch;
    width: 100%;
    min-width: 0;
  }

  .DrSelect__popup {
    z-index: var(--dr-layer-floating);
    width: max-content;
    border-radius: var(--dr-border-radius-surface);
    box-shadow: 0 var(--dr-space-small) var(--dr-space-large) rgb(0 0 0 / 18%);
  }
</style>
