<script setup lang="ts">
import { computed, ref } from 'vue';
import FocusContent from '@/dialogs/components/DrDialog/DrDialogFocus/FocusContent.story.vue';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import type { FocusContentProps } from '@/dialogs/components/DrDialog/DrDialogFocus/types.support';

defineOptions({ inheritAttrs: false });
const props = defineProps<FocusContentProps>();
const removable = ref(true);
const selected = ref('Alpha');

const next = useDialog({
  title: computed(() => `Dialog ${props.level + 1}`),
  component: FocusContent,
  props: { level: computed(() => props.level + 1) },
});

function handleNested() {
  next.open();
}

function handleRemove() {
  removable.value = false;
}
</script>

<template>
  <div class="DrFocusContent">
    <label>Name <input data-dr-dialog-initial-focus /></label>

    <button @click="handleNested">Open nested dialog</button>

    <label v-if="removable">Temporary field (Delete)
      <input @keydown.delete.prevent="handleRemove" />
    </label>

    <DrSelect
      v-model="selected"
      label="Choice"
      :items="['Alpha', 'Beta']"
    />

    <button>Last action</button>
  </div>
</template>

<style scoped>
  .DrFocusContent {
    display: grid;
    gap: var(--dr-space-small);
  }
</style>
