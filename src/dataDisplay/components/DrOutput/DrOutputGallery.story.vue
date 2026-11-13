<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrButton, DrCheckbox, DrInput, DrOutput, DrSection } from '@/index';

defineOptions({ inheritAttrs: false });

const name = ref('New project');
const loading = ref(false);
const revision = ref(1);
const result = computed(() => `${name.value}\nVersion: ${revision.value}\nStatus: ready`);

function handleRefresh() {
  revision.value += 1;
}
</script>

<template>
  <div class="GalleryExample">
    <DrSection title="Live result">
      <DrInput
        v-model="name"
        label="Name"
        :aria="{ clearButtonAriaLabel: 'Clear name' }"
        clearable
      />

      <div class="GalleryExample__row">
        <DrCheckbox
          v-model="loading"
          label="Loading"
        />

        <DrButton
          :disabled="loading"
          @click="handleRefresh"
        >Next version</DrButton>
      </div>

      <DrOutput
        class="GalleryExample__panel"
        accessible-label="Live result"
        :loading="loading"
      >{{ result }}</DrOutput>
    </DrSection>

    <DrSection title="Custom content">
      <DrOutput
        class="GalleryExample__panel"
        accessible-label="Export details"
      >
        <strong>Export ready</strong>

        <span>128 rows · CSV</span>

        <span>7c7af3e2-54b7-4c26-bb6a-61d703c510e7</span>
      </DrOutput>
    </DrSection>
  </div>
</template>
