<script setup lang="ts">
import { ref, watch } from 'vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import type {
  SelectCollectionItem,
  SelectCollectionsProps,
} from '@/forms/components/DrSelect/DrSelectCollections/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<SelectCollectionsProps>();

function createItem(id: number): SelectCollectionItem {
  return { id, label: `Option ${id}` };
}

const initialItems = Array.from({ length: 40 }, (_, index) => createItem(index + 1));
const items = ref(initialItems);
const selected = ref(initialItems[19]);

watch(() => props.operation, (operation) => {
  if (operation == null) {
    return;
  }

  switch (operation) {
    case 'reverse':
      items.value.reverse();
      break;

    case 'sort':
      items.value.sort((first, second) => first.id - second.id);
      break;

    case 'splice':
      items.value.splice(0, 2, createItem(41), createItem(42));
      break;

    case 'replace':
      items.value = [...items.value.slice(20), ...items.value.slice(0, 20)];
      break;

    case 'add':
      items.value.unshift(createItem(43));
      break;

    case 'remove':
      items.value.splice(0, 1);
  }
});
</script>

<template>
  <DrSelect
    v-model="selected"
    label="Collection"
    :items="items"
  >
    <template #item="{ item, active }">
      <span :data-active="active || undefined">{{ item.label }}</span>
    </template>
  </DrSelect>

  <p data-testid="selection">{{ selected.label }}</p>
</template>
