<script setup lang="ts">
import { defineComponent } from 'vue';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';

const DialogFooter = defineComponent({
  inheritAttrs: false,
  setup: () => () => 'Select an option from the list.',
});

const dialog = useDialog({
  title: 'Select dialog',
  component: DrSelect<string>,
  props: {
    class: 'DrSelectDialog__content',
    label: 'Dialog select',
    items: Array.from({ length: 40 }, (_, index) => `Option ${index + 1}`),
    modelValue: 'Option 40',
  },
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
  :global(.DrSelectDialog__content) {
    padding: var(--dr-space-large);
  }
</style>
