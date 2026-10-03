<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrCheckbox, DrControl } from '@/index';

defineOptions({ inheritAttrs: false });

const volume = ref(40);
const disabled = ref(false);
const showError = ref(false);
const state = computed(() => (showError.value ? 'error' : 'normal'));
const message = computed(() => (showError.value ? 'Sample error' : 'Custom control'));
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__row">
      <DrControl
        class="DrControlGallery__control"
        :disabled="disabled"
        :state="state"
        :message="message"
        bordered
      >
        <template #label>Volume: {{ volume }}%</template>

        <template #default="slot">
          <input
            :id="slot.id"
            v-model.number="volume"
            class="DrControlGallery__range"
            type="range"
            min="0"
            max="100"
            :disabled="slot.disabled"
            :aria-describedby="slot.describedBy"
            :aria-invalid="slot.state === 'error' || undefined"
          />
        </template>
      </DrControl>

      <DrCheckbox
        v-model="disabled"
        label="Disabled"
      />

      <DrCheckbox
        v-model="showError"
        label="Error"
      />
    </div>

  </div>
</template>

<style scoped>
  .DrControlGallery__control {
    flex: 0 1 24rem;
  }

  .DrControlGallery__range {
    width: 100%;
    margin: var(--dr-space-medium);

    @supports (accent-color: var(--dr-color-background-accent)) {
      accent-color: var(--dr-color-background-accent);
    }
  }
</style>
