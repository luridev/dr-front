<script setup lang="ts">
import { computed } from 'vue';
import { truncate } from '@/numbers/lib/truncate/truncate';
import type { DrGridAlign, DrGridProps } from '@/layout/components/DrGrid/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrGridProps>(), {
  columns: 1,
  adaptive: true,
  align: 'baseline',
});

const alignClasses = {
  top: 'DrGrid_align_top',
  center: 'DrGrid_align_center',
  baseline: 'DrGrid_align_baseline',
  bottom: 'DrGrid_align_bottom',
} as const satisfies Record<DrGridAlign, string>;

const rootClasses = computed(() => [
  {
    DrGrid_adaptive: props.adaptive,
  },
  alignClasses[props.align],
]);

const rootStyles = computed(() => ({
  '--dr-grid-columns': String(Math.max(1, truncate(props.columns, 1))),
}));
</script>

<template>
  <div
    class="DrGrid"
    :class="[rootClasses, $attrs.class]"
    :style="rootStyles"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
  .DrGrid {
    --dr-grid-columns: 1;

    display: grid;
    min-width: 0;
    grid-template-columns: repeat(var(--dr-grid-columns), minmax(0, 1fr));
    gap: var(--dr-space-small) var(--dr-space-medium);
  }

  .DrGrid_align_top {
    align-items: start;
  }

  .DrGrid_align_center {
    align-items: center;
  }

  .DrGrid_align_baseline {
    align-items: first baseline;
  }

  .DrGrid_align_bottom {
    align-items: end;
  }

  @media (width <= 560px) {
    .DrGrid_adaptive {
      --dr-grid-item-column: auto;

      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
