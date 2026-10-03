<script setup lang="ts">
import { ref } from 'vue';
import { galleryCities, galleryEmptyItems } from '@/forms/components/DrSelect/config.support';
import { DrButton, DrSelect } from '@/index';

defineOptions({ inheritAttrs: false });

const city = ref<string>();
const disabledCity = ref('Tokyo');
const emptyCity = ref<string>();
const errorCity = ref<string>();

function handleReset(): void {
  city.value = undefined;
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__grid">
      <DrSelect
        v-model="city"
        label="City"
        :items="galleryCities"
        placeholder="Choose a city"
      >
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
        label="Error"
        :items="galleryCities"
        placeholder="Choose a city"
        state="error"
        message="Choose a delivery city."
      />

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
  </div>
</template>

<style scoped>
  .DrSelectGallery__note {
    margin: 0;
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-small);
  }
</style>
