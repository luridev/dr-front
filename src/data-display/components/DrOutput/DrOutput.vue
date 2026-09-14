<script setup lang="ts">
import type { DrOutputProps } from '@/data-display/components/DrOutput/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrOutputProps>(), {
  loading: false,
});
</script>

<template>
  <output
    class="DrOutput"
    :class="$attrs.class"
    aria-label="Результат"
    aria-live="polite"
    aria-atomic="true"
    :aria-busy="props.loading"
  >
    <slot></slot>
  </output>
</template>

<style scoped>
  .DrOutput {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--dr-space-medium);
    width: 100%;
    min-width: 0;
    font-family: var(--dr-font-family-mono);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
