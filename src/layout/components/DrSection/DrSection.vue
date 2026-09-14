<script setup lang="ts">
import DrSectionHeader from '@/layout/components/DrSectionHeader/DrSectionHeader.vue';
import type { DrSectionProps, DrSectionSlots } from '@/layout/components/DrSection/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrSectionProps>();
const slots = defineSlots<DrSectionSlots>();
</script>

<template>
  <section
    class="DrSection"
    :class="$attrs.class"
  >
    <DrSectionHeader :title="props.title">
      <template
        v-if="slots.actions != null"
        #actions
      >
        <slot name="actions"></slot>
      </template>
    </DrSectionHeader>

    <slot></slot>
  </section>
</template>

<style scoped>
  .DrSection {
    display: flex;
    flex-direction: column;
    gap: var(--dr-space-medium);
    min-width: 0;
  }
</style>
