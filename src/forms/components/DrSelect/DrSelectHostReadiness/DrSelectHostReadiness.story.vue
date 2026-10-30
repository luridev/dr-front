<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import DrModalHost from '@/overlays/components/DrModalHost/DrModalHost.vue';
import type { DrSelectHostReadinessProps } from '@/forms/components/DrSelect/DrSelectHostReadiness/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrSelectHostReadinessProps>();
const backgroundRoot = useTemplateRef<HTMLElement>('backgroundRoot');

const modalBackground = computed(() => {
  if (!props.ready) {
    return null;
  }

  if (props.rootKind === 'body') {
    return document.body;
  }

  return backgroundRoot.value;
});

const items = Array.from({ length: 20 }, (_, index) => `Option ${index + 1} with a longer label`);
const selected = ref(items[0]);
</script>

<template>
  <DrModalHost :background-root="modalBackground">
    <div
      ref="backgroundRoot"
      data-testid="background"
    >
      <Teleport
        to="body"
        :disabled="!props.teleportSelect"
      >
        <DrSelect
          v-model="selected"
          label="Ready select"
          :items="items"
        />
      </Teleport>
    </div>
  </DrModalHost>
</template>
