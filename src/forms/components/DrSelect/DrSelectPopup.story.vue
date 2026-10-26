<script setup lang="ts">
import { shallowRef } from 'vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import type { SelectPopupProps } from '@/forms/components/DrSelect/types.support';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SelectPopupProps>(), { before: true, after: true });
const items = Array.from({ length: 40 }, (_, id) => ({ id, label: `Option ${id + 1}` }));
const selected = shallowRef(items[39]);
</script>

<template>
  <div>
    <button v-if="props.before">Before select</button>

    <div
      data-testid="scroll-frame"
      class="DrSelectPopup__frame"
    >
      <DrSelect
        v-model="selected"
        label="Choice"
        :items="items"
        :disabled="props.disabled"
      >
        <template #item="{ item }">{{ item.label }}</template>
      </DrSelect>
    </div>

    <button v-if="props.after">After select</button>

    <p data-testid="selection">{{ selected.id }}</p>
  </div>
</template>

<style scoped>
  .DrSelectPopup__frame {
    width: 320px;
  }
</style>
