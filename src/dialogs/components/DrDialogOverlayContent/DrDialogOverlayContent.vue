<script setup lang="ts">
import DrDialog from '@/dialogs/components/DrDialog/DrDialog.vue';
import DrComponent from '@/dynamic-components/components/DrComponent/DrComponent.vue';
import type { DrDialogOverlayContentProps } from '@/dialogs/components/DrDialogOverlayContent/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrDialogOverlayContentProps>();
</script>

<template>
  <DrDialog
    :id="props.id"
    :title="props.title"
    :close="props.close"
  >
    <DrComponent :definition="props.content" />

    <template
      v-if="props.footer != null"
      #footer
    >
      <DrComponent :definition="props.footer" />
    </template>
  </DrDialog>
</template>
