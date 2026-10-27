<script setup lang="ts">
import { ref } from 'vue';
import { DrButton, DrCheckbox, DrInput, DrSelect } from '@/index';

defineOptions({ inheritAttrs: false });

const name = ref('Dialog draft');
const priority = ref('Normal');
const priorities = ['Low', 'Normal', 'High'];
const notify = ref(true);

function handleRestore() {
  name.value = 'Dialog draft';
}
</script>

<template>
  <div class="GalleryExample DrFocusDialogContent">
    <DrInput
      v-model="name"
      label="Dialog input"
    />

    <DrSelect
      v-model="priority"
      label="Dialog priority"
      :items="priorities"
    />

    <DrCheckbox
      v-model="notify"
      label="Notify the team"
    />

    <DrButton @click="handleRestore">Restore draft</DrButton>
  </div>
</template>

<style scoped>
  .DrFocusDialogContent {
    padding: var(--dr-space-large);
  }
</style>
