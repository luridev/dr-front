<script setup lang="ts">
import { defineComponent } from 'vue';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import { DialogContent } from '@/forms/components/DrSelect/DrSelectDialog/content.support';

const DialogFooter = defineComponent({
  inheritAttrs: false,
  setup: () => () => 'Select an option from the list.',
});

const dialog = useDialog({
  title: 'Select dialog',
  component: DialogContent,
  footer: { component: DialogFooter },
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

<style scoped>
  :global(.DrSelectDialog__note) {
    margin: 0;
    padding: var(--dr-space-medium);
  }

  :global(.DrSelectDialog__content) {
    padding: var(--dr-space-large);
  }
</style>
