<script setup lang="ts">
import { computed, ref, shallowRef, toRaw, watch } from 'vue';
import { galleryDeliveryOptions } from '@/forms/components/DrRadioGroup/config.support';
import { DrRadioGroup } from '@/index';
import type { DrRadioGroupGalleryProps, RadioGroupGalleryItem } from '@/forms/components/DrRadioGroup/types.support';

defineOptions({ inheritAttrs: false });
const props = defineProps<DrRadioGroupGalleryProps>();

const delivery = ref('Courier');
const verticalDelivery = ref('Pickup point');
const disabledDelivery = ref('In store');

const items = shallowRef<Array<RadioGroupGalleryItem>>([]);
const selected = ref<RadioGroupGalleryItem>(1);
const visible = ref(true);
const updates = ref(0);
const receivedIndex = ref(-1);
const selectedIndex = computed(() => items.value.findIndex((item) => toRaw(item) === toRaw(selected.value)));

watch(() => props.values, (values) => {
  items.value = values === 'mixed' ? [1, '1'] : [{ id: 1 }, { id: 1 }];
  selected.value = items.value[0];
}, { immediate: true });

function handleSelection(item: RadioGroupGalleryItem) {
  updates.value += 1;
  receivedIndex.value = items.value.findIndex((candidate) => candidate === item);

  switch (props.response) {
    case 'reject':
      return;
    case 'clone':
      selected.value = typeof item === 'object' ? { ...item } : item;

      return;
    case 'reverse':
      items.value = [...items.value].reverse();
      break;
    case 'unmount':
      visible.value = false;
      break;
    case 'accept':
    case undefined:
      break;
  }

  selected.value = item;
}

watch(() => props.operation, (operation) => {
  switch (operation) {
    case 'clone-model':
      if (typeof selected.value === 'object') {
        selected.value = { ...selected.value };
      }

      break;
    case 'replace-items':
      items.value = items.value.map((item) => typeof item === 'object' ? { ...item } : item);
      break;
    case 'select-first':
      selected.value = items.value[0];
      break;
    case 'select-last-async':
      setTimeout(() => {
        selected.value = items.value[items.value.length - 1];
      }, 0);

      break;
    case undefined:
      break;
  }
});
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__row DrRadioGroupGallery__variants">
      <DrRadioGroup
        v-model="delivery"
        label="Row"
        :items="galleryDeliveryOptions"
      >
        <template #item="{ item }">{{ item }}</template>
      </DrRadioGroup>

      <DrRadioGroup
        v-model="verticalDelivery"
        label="Column"
        :items="galleryDeliveryOptions"
        direction="column"
      >
        <template #item="{ item, checked }">{{ item }} <span v-if="checked">— selected</span></template>
      </DrRadioGroup>

      <DrRadioGroup
        v-model="disabledDelivery"
        label="Disabled"
        :items="galleryDeliveryOptions"
        disabled
      >
        <template #item="{ item }">{{ item }}</template>
      </DrRadioGroup>
    </div>

    <p class="GalleryExample__output">
      Row: {{ delivery }} · Column: {{ verticalDelivery }}
    </p>

    <template v-if="props.values != null">
      <DrRadioGroup
        v-if="visible"
        :model-value="selected"
        label="Values"
        :items="items"
        @update:model-value="handleSelection"
      >
        <template #item="{ item, index, checked }">
          <span
            data-testid="value-slot"
            :data-checked="checked"
          >{{ index }}: {{ item }} <span v-if="checked">— selected</span></span>
        </template>
      </DrRadioGroup>

      <output
        data-testid="value-model"
        aria-label="Selected value"
        :data-selected-index="selectedIndex"
        :data-received-index="receivedIndex"
        :data-updates="updates"
      >{{ selected }}</output>
    </template>
  </div>
</template>

<style scoped>
  .DrRadioGroupGallery__variants {
    align-items: start;
  }
</style>
