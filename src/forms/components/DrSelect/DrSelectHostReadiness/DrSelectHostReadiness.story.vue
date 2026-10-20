<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import DrModalHost from '@/overlays/components/DrModalHost/DrModalHost.vue';
import type { DrSelectHostReadinessProps } from '@/forms/components/DrSelect/DrSelectHostReadiness/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrSelectHostReadinessProps>();
const backgroundRoot = useTemplateRef<HTMLElement>('backgroundRoot');
const items = Array.from({ length: 20 }, (_, index) => `Option ${index + 1} with a longer label`);
const selected = ref(items[0]);
</script>

<template>
  <DrModalHost :background-root="props.ready ? backgroundRoot : null">
    <div
      ref="backgroundRoot"
      data-testid="background"
    >
      <DrSelect
        v-model="selected"
        label="Ready select"
        :items="items"
      />
    </div>
  </DrModalHost>
</template>
