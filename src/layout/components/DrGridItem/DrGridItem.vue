<script setup lang="ts">
import { computed } from 'vue';
import { truncate } from '@/numbers/lib/truncate/truncate';
import type {
  DrGridItemAlign,
  DrGridItemJustify,
  DrGridItemProps,
  DrGridItemSticky,
} from '@/layout/components/DrGridItem/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrGridItemProps>(), {
  span: false,
});

const stickyClasses = {
  top: 'DrGridItem_sticky_top',
  bottom: 'DrGridItem_sticky_bottom',
} as const satisfies Record<DrGridItemSticky, string>;

const justifyClasses = {
  left: 'DrGridItem_justify_left',
  center: 'DrGridItem_justify_center',
  right: 'DrGridItem_justify_right',
} as const satisfies Record<DrGridItemJustify, string>;

const alignClasses = {
  top: 'DrGridItem_align_top',
  center: 'DrGridItem_align_center',
  baseline: 'DrGridItem_align_baseline',
  bottom: 'DrGridItem_align_bottom',
} as const satisfies Record<DrGridItemAlign, string>;

const rootClasses = computed(() => [
  {
    DrGridItem_full: props.span === true,
  },
  props.sticky != null ? stickyClasses[props.sticky] : undefined,
  props.justify != null ? justifyClasses[props.justify] : undefined,
  props.align != null ? alignClasses[props.align] : undefined,
]);

const rootStyles = computed(() => {
  if (typeof props.span !== 'number') {
    return undefined;
  }

  return {
    '--dr-grid-item-span': String(Math.max(1, truncate(props.span, 1))),
  };
});
</script>

<template>
  <div
    class="DrGridItem"
    :class="[rootClasses, $attrs.class]"
    :style="rootStyles"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
  .DrGridItem {
    --dr-grid-item-span: 1;
    --dr-grid-item-sticky-offset: var(--dr-space-medium);

    min-width: 0;
    grid-column: var(--dr-grid-item-column, span var(--dr-grid-item-span));
  }

  .DrGridItem_full {
    grid-column: var(--dr-grid-item-column, 1 / -1);
  }

  .DrGridItem_sticky_top {
    position: sticky;
    top: var(--dr-grid-item-sticky-offset);
  }

  .DrGridItem_sticky_bottom {
    position: sticky;
    bottom: var(--dr-grid-item-sticky-offset);
  }

  .DrGridItem_justify_left {
    justify-self: start;
  }

  .DrGridItem_justify_center {
    justify-self: center;
  }

  .DrGridItem_justify_right {
    justify-self: end;
  }

  .DrGridItem_align_top {
    align-self: start;
  }

  .DrGridItem_align_center {
    align-self: center;
  }

  .DrGridItem_align_baseline {
    align-self: first baseline;
  }

  .DrGridItem_align_bottom {
    align-self: end;
  }

  .DrGridItem_sticky_top,
  .DrGridItem_sticky_bottom {
    align-self: start;
  }
</style>
