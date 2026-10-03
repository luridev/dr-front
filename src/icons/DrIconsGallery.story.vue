<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrArrowLeftIcon, DrCheckIcon, DrChevronDownIcon, DrChevronUpIcon, DrCloseIcon, DrPlusMinusIcon } from '@/icons';
import { DrCheckbox } from '@/index';

defineOptions({ inheritAttrs: false });

const large = ref(false);
const accent = ref(false);
const size = computed(() => (large.value ? 40 : 24));
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__row">
      <DrCheckbox
        v-model="large"
        label="Large (40 px)"
      />

      <DrCheckbox
        v-model="accent"
        label="Accent color"
      />
    </div>

    <div
      class="DrIconsGallery__grid"
      :class="{ DrIconsGallery__grid_accent: accent }"
    >
      <figure class="DrIconsGallery__item">
        <DrArrowLeftIcon :size="size" />

        <figcaption>DrArrowLeftIcon</figcaption>
      </figure>

      <figure class="DrIconsGallery__item">
        <DrCheckIcon :size="size" />

        <figcaption>DrCheckIcon</figcaption>
      </figure>

      <figure class="DrIconsGallery__item">
        <DrChevronDownIcon :size="size" />

        <figcaption>DrChevronDownIcon</figcaption>
      </figure>

      <figure class="DrIconsGallery__item">
        <DrChevronUpIcon :size="size" />

        <figcaption>DrChevronUpIcon</figcaption>
      </figure>

      <figure class="DrIconsGallery__item">
        <DrCloseIcon :size="size" />

        <figcaption>DrCloseIcon</figcaption>
      </figure>

      <figure class="DrIconsGallery__item">
        <DrPlusMinusIcon :size="size" />

        <figcaption>DrPlusMinusIcon</figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
  .DrIconsGallery__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--dr-space-medium);
  }

  .DrIconsGallery__grid_accent {
    color: var(--dr-color-text-warning);
  }

  .DrIconsGallery__item {
    display: grid;
    justify-items: center;
    gap: var(--dr-space-small);
    min-width: 0;
    margin: 0;
    padding: var(--dr-space-medium);
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-control);
    font-size: var(--dr-font-size-small);
    text-align: center;
    overflow-wrap: anywhere;
  }
</style>
