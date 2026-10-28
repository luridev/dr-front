<script setup lang="ts" generic="T">
import DrDialog from '@/dialogs/components/DrDialog/DrDialog.vue';
import DrSelectList from '@/forms/components/DrSelect/components/DrSelectList/DrSelectList.vue';
import DrOverlayLayer from '@/overlays/components/DrOverlayLayer/DrOverlayLayer.vue';
import type { DrSelectListSlots } from '@/forms/components/DrSelect/components/DrSelectList/types';
import type { DrSelectMobileDialogEmits, DrSelectMobileDialogProps } from '@/forms/components/DrSelect/components/DrSelectMobileDialog/types';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrSelectMobileDialogProps<T>>();
const emit = defineEmits<DrSelectMobileDialogEmits<T>>();
const slots = defineSlots<DrSelectListSlots<T>>();

function handleSelect(item: T) {
  emit('select', item);
  props.layer.close();
}
</script>

<template>
  <Teleport :to="props.portalTarget">
    <DrOverlayLayer
      :layer="props.layer"
      :is-top-layer="props.isTopLayer"
      :order="props.order"
    >
      <DrDialog
        :id="props.dialogId"
        :title="props.accessibleLabel"
        :close="props.layer.close"
      >
        <DrSelectList
          :id="props.id"
          :items="props.items"
          :selected-item="props.selectedItem"
          :has-selection="props.hasSelection"
          :active-index="props.activeIndex"
          :accessible-label="props.accessibleLabel"
          :tabindex="0"
          @select="handleSelect"
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
      </DrDialog>
    </DrOverlayLayer>
  </Teleport>
</template>
