<script setup lang="ts">
import { ref } from 'vue';
import { DrControl, DrInput, DrTextarea } from '@/index';

defineOptions({ inheritAttrs: false });

const draft = ref('A draft with a nested field in its actions slot.');
const tag = ref('Review');
</script>

<template>
  <div class="GalleryExample">
    <DrTextarea
      v-model="draft"
      label="Draft"
      :rows="2"
    >
      <template #actions>
        <DrInput
          v-model="tag"
          label="Tag"
        />
      </template>
    </DrTextarea>

    <DrControl bordered>
      <template #label>Unmarked action</template>

      <button
        class="DrFocusNesting__action"
        type="button"
      >Native action inside a surface</button>
    </DrControl>

    <label>
      Standalone target
      <input
        data-dr-focus-target
        type="text"
        value="No surface"
      />
    </label>
  </div>
</template>

<style scoped>
  .DrFocusNesting__action {
    margin: var(--dr-space-small);
  }
</style>
