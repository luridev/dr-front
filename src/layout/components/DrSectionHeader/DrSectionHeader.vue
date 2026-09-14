<script setup lang="ts">
import type { DrSectionHeaderProps, DrSectionHeaderSlots } from '@/layout/components/DrSectionHeader/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrSectionHeaderProps>();
const slots = defineSlots<DrSectionHeaderSlots>();
</script>

<template>
  <header
    class="DrSectionHeader"
    :class="$attrs.class"
  >
    <span class="DrSectionHeader__title">
      {{ props.title }}
    </span>

    <span
      class="DrSectionHeader__divider"
      aria-hidden="true"
    ></span>

    <div
      v-if="slots.actions != null"
      class="DrSectionHeader__actions"
    >
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<style scoped>
  .DrSectionHeader {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--dr-space-small);
    min-width: 0;
  }

  .DrSectionHeader__title {
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-medium);
    line-height: 1.3;
    white-space: nowrap;
  }

  .DrSectionHeader__divider {
    width: 100%;
    height: 1px;
    background: var(--dr-color-border-primary);
  }

  .DrSectionHeader__actions {
    display: flex;
    align-items: center;
    gap: var(--dr-space-small);
  }
</style>
