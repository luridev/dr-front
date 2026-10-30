<script setup lang="ts" generic="T">
import { computed, nextTick, onMounted, ref, shallowRef, useId, useTemplateRef, watch } from 'vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import DrSelectList from '@/forms/components/DrSelect/components/DrSelectList/DrSelectList.vue';
import DrSelectMobileDialog from '@/forms/components/DrSelect/components/DrSelectMobileDialog/DrSelectMobileDialog.vue';
import DrSelectTrigger from '@/forms/components/DrSelect/components/DrSelectTrigger/DrSelectTrigger.vue';
import { useDrSelectAria } from '@/forms/components/DrSelect/composables/useDrSelectAria/useDrSelectAria';
import { useDrSelectDesktopPopup } from '@/forms/components/DrSelect/composables/useDrSelectDesktopPopup/useDrSelectDesktopPopup';
import { useDrSelectNavigation } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/useDrSelectNavigation';
import { useDrSelectTriggerKeyboard } from '@/forms/components/DrSelect/composables/useDrSelectTriggerKeyboard/useDrSelectTriggerKeyboard';
import { isSameValue } from '@/forms/lib/isSameValue/isSameValue';
import { useOverlay } from '@/overlays/composables/useOverlay/useOverlay';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type { DrSelectListExposed } from '@/forms/components/DrSelect/components/DrSelectList/types';
import type { DrSelectMobileDialogExposed } from '@/forms/components/DrSelect/components/DrSelectMobileDialog/types';
import type { DrSelectTriggerExposed } from '@/forms/components/DrSelect/components/DrSelectTrigger/types';
import type { DrSelectInitialActiveItem } from '@/forms/components/DrSelect/composables/useDrSelectNavigation/types';
import type {
  DrSelectExposed,
  DrSelectItemSlotProps,
  DrSelectPresentation,
  DrSelectProps,
  DrSelectSlots,
} from '@/forms/components/DrSelect/types';
import type { OverlayHandle } from '@/overlays/types';

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
const mobileDialog = useTemplateRef<DrSelectMobileDialogExposed>('mobileDialog');
const mobileLabelTarget = computed(() => mobileDialog.value?.labelTarget ?? undefined);
const reference = computed(() => trigger.value?.element ?? null);

const selectId = useId();
const labelId = `${selectId}-label`;
const desktopListboxId = `${selectId}-listbox`;
const mobileListboxId = `${selectId}-dialog-listbox`;

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

  return item === undefined ? -1 : props.items.findIndex((candidate) => isSameValue(candidate, item));
});

const effectiveDisabled = computed(() => props.disabled || props.items.length === 0);
const placeholderText = computed(() => (props.items.length === 0 ? props.emptyText ?? t('select.empty') : props.placeholder));
const isPlaceholderVisible = computed(() => !hasSelection.value);

function getLabelledBy() {
  return slots.label != null || isNonBlankString(props.label) ? labelId : undefined;
}

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

const overlay = useOverlay();
const itemsDialogId = useId();
const itemsDialogHandle = shallowRef<OverlayHandle>();
const isItemsDialogOpen = computed(() => itemsDialogHandle.value != null);
const mobileLayer = computed(() => itemsDialogHandle.value?.layer);
const mobileLayerIsTop = computed(() => mobileLayer.value != null && overlay.isTop(mobileLayer.value.token));
const mobileLayerOrder = computed(() => mobileLayer.value == null ? 0 : overlay.order(mobileLayer.value.token));

watch(overlay.isActive, (active) => {
  if (!active) {
    desktopPopup.close();
  }
}, { flush: 'sync' });

function openItemsDialog() {
  const handle = overlay.open({
    opener: reference.value,
    onClose: () => {
      if (itemsDialogHandle.value === handle) {
        itemsDialogHandle.value = undefined;
      }
    },
  });

  itemsDialogHandle.value = handle;
}

function closeItemsDialog() {
  itemsDialogHandle.value?.close();
}

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
  presentation.value = overlay.isModalAvailable() && window.matchMedia(mobileMediaQuery).matches ? 'dialog' : 'listbox';
}

function openOptions(initialActiveItem: DrSelectInitialActiveItem = 'selected') {
  if (!overlay.isActive.value || effectiveDisabled.value || desktopPopup.isOpen.value || isItemsDialogOpen.value) {
    return;
  }

  updatePresentation();

  if (presentation.value === 'listbox' && !desktopPopup.ownerActive.value) {
    return;
  }

  navigation.activateInitialItem(initialActiveItem);

  if (presentation.value === 'dialog') {
    dialogInitialActiveIndex.value = navigation.activeIndex.value;

    openItemsDialog();

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
      <!-- Keep one label subtree, including consumer IDs, outside the inert background while the dialog is open. -->
      <Teleport
        v-if="getLabelledBy() != null"
        :to="mobileLabelTarget"
        :disabled="mobileLabelTarget == null"
      >
        <span :id="labelId">
          <slot name="label">{{ props.label }}</slot>
        </span>
      </Teleport>
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
          :accessible-label="accessibleLabel"
          :labelled-by="getLabelledBy()"
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
              :labelled-by="getLabelledBy()"
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

      <DrSelectMobileDialog
        v-if="mobileLayer != null && overlay.portalTarget.value != null"
        :id="mobileListboxId"
        :key="mobileLayer.uid"
        ref="mobileDialog"
        :dialog-id="itemsDialogId"
        :layer="mobileLayer"
        :portal-target="overlay.portalTarget.value"
        :is-top-layer="mobileLayerIsTop"
        :order="mobileLayerOrder"
        :items="props.items"
        :selected-item="selectedItem"
        :has-selection="hasSelection"
        :active-index="dialogInitialActiveIndex"
        :accessible-label="accessibleLabel"
        :labelled-by="getLabelledBy()"
        @select="selectDialogItem"
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
      </DrSelectMobileDialog>
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
    display: flex;
    flex-direction: column;
    width: max-content;
    max-height: min(20rem, var(--dr-select-available-height, 20rem));
    overflow: clip;
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-surface);
    background: var(--dr-color-background-primary);
    color: var(--dr-color-text-primary);
    box-shadow: 0 var(--dr-space-small) var(--dr-space-large) rgb(0 0 0 / 18%);
  }
</style>
