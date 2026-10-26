<script setup lang="ts">
import { useTemplateRef } from 'vue';
import FocusContent from '@/dialogs/components/DrDialog/DrDialogFocus/FocusContent.story.vue';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';

defineOptions({ inheritAttrs: false });
const returnTarget = useTemplateRef<HTMLButtonElement>('returnTarget');
const dialog = useDialog({ title: 'Dialog 1', component: FocusContent, props: { level: 1 } });

function handleExplicitOpen() {
  dialog.open(undefined, { opener: returnTarget.value });
}

function handleLegacyOpen() {
  dialog.open();
}
</script>

<template>
  <div class="GalleryExample">
    <p>Nested dialogs and focus return.</p>

    <div class="GalleryExample__row">
      <button @click="handleExplicitOpen">Open with explicit target</button>

      <button ref="returnTarget">Return target</button>

      <button @click="handleLegacyOpen">Open from current focus</button>
    </div>
  </div>
</template>
