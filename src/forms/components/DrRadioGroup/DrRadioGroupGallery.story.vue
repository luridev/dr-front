<script setup lang="ts">
import { ref } from 'vue';
import { galleryDeliveryOptions } from '@/forms/components/DrRadioGroup/config.support';
import { DrRadioGroup } from '@/index';

defineOptions({ inheritAttrs: false });

const delivery = ref('Courier');
const verticalDelivery = ref('Pickup point');
const disabledDelivery = ref('In store');
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
  </div>
</template>

<style scoped>
  .DrRadioGroupGallery__variants {
    align-items: start;
  }
</style>
