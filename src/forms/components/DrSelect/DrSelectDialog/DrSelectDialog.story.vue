<script setup lang="ts">
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';

const dialog = useDialog({
  title: 'Select dialog',
  component: DrSelect<string>,
  props: {
    label: 'Dialog select',
    items: Array.from({ length: 40 }, (_, index) => `Option ${index + 1}`),
    modelValue: 'Option 40',
  },
});
</script>

<template>
  <button
    type="button"
    @click="dialog.open"
  >
    Open dialog
  </button>
</template>
