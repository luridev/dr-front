<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber } from '@/formatting/lib/formatNumber/formatNumber';
import { characterCounterDisplayThreshold } from '@/forms/components/DrTextareaPanel/config';
import type { DrTextareaPanelProps } from '@/forms/components/DrTextareaPanel/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrTextareaPanelProps>(), {
  showCounter: true,
});

const counterText = computed(() =>
  props.maxLength == null ? '' : `${formatNumber(props.textLength)} / ${formatNumber(props.maxLength)}`,
);

const isCounterVisible = computed(
  () =>
    props.showCounter &&
      props.maxLength != null &&
      props.textLength >= props.maxLength * characterCounterDisplayThreshold,
);
</script>

<template>
  <div
    class="DrTextareaPanel"
    :class="$attrs.class"
  >
    <slot></slot>

    <div class="DrTextareaPanel__footer">
      <div class="DrTextareaPanel__actions">
        <slot name="actions"></slot>
      </div>

      <span
        v-if="isCounterVisible"
        class="DrTextareaPanel__counter"
        aria-hidden="true"
      >
        {{ counterText }}
      </span>
    </div>
  </div>
</template>

<style scoped>
  .DrTextareaPanel {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  .DrTextareaPanel__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--dr-space-xsmall) var(--dr-space-small);
    min-width: 0;
    padding: 0 var(--dr-space-small) var(--dr-space-small);
  }

  .DrTextareaPanel__actions {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;
    gap: var(--dr-space-xsmall);
    min-width: 0;
  }

  .DrTextareaPanel__counter {
    flex: 0 0 auto;
    margin-inline-start: auto;
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-small);
    white-space: nowrap;
  }
</style>
