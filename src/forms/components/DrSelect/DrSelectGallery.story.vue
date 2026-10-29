<script setup lang="ts">
import { computed, ref, shallowRef, toRaw, watch } from 'vue';
import { galleryCities, galleryEmptyItems } from '@/forms/components/DrSelect/config.support';
import { DrButton, DrSelect } from '@/index';
import type { DrSelectGalleryProps, SelectGalleryItem } from '@/forms/components/DrSelect/types.support';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrSelectGalleryProps>(), {
  label: 'City',
  placeholder: 'Choose a city',
});

const city = ref<string>();
const disabledCity = ref('Tokyo');
const emptyCity = ref<string>();
const errorCity = ref<string>();

const items = shallowRef<Array<SelectGalleryItem>>([]);
const selected = ref<SelectGalleryItem>(1);
const selectedIndex = computed(() => items.value.findIndex((item) => toRaw(item) === toRaw(selected.value)));
const updates = ref(0);
const receivedIndex = ref(-1);

watch(() => props.values, (values) => {
  items.value = values === 'mixed' ? [1, '1'] : [{ id: 1 }, { id: 1 }];
  selected.value = items.value[0];
}, { immediate: true });

watch(() => props.operation, (operation) => {
  switch (operation) {
    case 'select-first':
      selected.value = items.value[0];
      break;
    case 'select-last':
      selected.value = items.value[items.value.length - 1];
      break;
    case 'clone-model':
      if (typeof selected.value === 'object') {
        selected.value = { ...selected.value };
      }

      break;
    case 'replace-items':
      items.value = items.value.map((item) => typeof item === 'object' ? { ...item } : item);
      break;
    case undefined:
      break;
  }
});

function handleSelection(item: SelectGalleryItem) {
  updates.value += 1;
  receivedIndex.value = items.value.findIndex((candidate) => candidate === item);

  if (props.response !== 'reject') {
    selected.value = props.response === 'clone' && typeof item === 'object' ? { ...item } : item;
  }
}

function handleReset(): void {
  city.value = undefined;
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__grid">
      <DrSelect
        v-model="city"
        :label="props.label"
        :items="galleryCities"
        :placeholder="props.placeholder"
      >
        <template
          v-if="props.slotLabel != null"
          #label
        >
          <span
            id="gallery-city-label"
            data-testid="city-label"
          >{{ props.slotLabel }}<span aria-hidden="true"> *</span></span>
        </template>

        <template #item="{ item }">{{ item }}</template>
      </DrSelect>

      <DrSelect
        v-model="disabledCity"
        label="Disabled"
        :items="galleryCities"
        disabled
      />

      <DrSelect
        v-model="errorCity"
        :items="galleryCities"
        placeholder="Choose a city"
        state="error"
        message="Choose a delivery city."
      >
        <template #label>Error</template>
      </DrSelect>

      <DrSelect
        v-model="emptyCity"
        label="Empty"
        :items="galleryEmptyItems"
        empty-text="No cities available"
      />
    </div>

    <div class="GalleryExample__row">
      <DrButton
        variant="outline"
        @click="handleReset"
      >Reset city</DrButton>
    </div>

    <p class="GalleryExample__output">Selected city: {{ city ?? 'none' }}</p>

    <p class="DrSelectGallery__note">Mobile dialog mode requires DrModalHost.</p>

    <template v-if="props.values != null">
      <DrSelect
        :model-value="selected"
        label="Values"
        :items="items"
        @update:model-value="handleSelection"
      >
        <template #item="{ item, index, selected: isSelected, active }">
          <span
            data-testid="value-slot"
            :data-index="index"
            :data-selected="isSelected"
            :data-active="active"
          >{{ index }}: {{ item }}</span>
        </template>
      </DrSelect>

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
  .DrSelectGallery__note {
    margin: 0;
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-small);
  }
</style>
