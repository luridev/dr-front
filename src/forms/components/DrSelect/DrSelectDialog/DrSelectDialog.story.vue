<script setup lang="ts">
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';

const dialog = useDialog({
  title: 'Select dialog',
  component: DrSelect<string>,
  props: {
    label: 'Dialog select',
    items: ['Alpha', 'Beta'],
    modelValue: 'Alpha',
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
