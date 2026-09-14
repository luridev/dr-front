<script setup lang="ts">
import { computed } from 'vue';
import type {
  DrControlGroupLabelPosition,
  DrControlGroupProps,
} from '@/forms/components/DrControlGroup/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrControlGroupProps>(), {
  labelPosition: 'left',
  labelAlign: 'left',
});

const labelPositionClasses = {
  top: 'DrControlGroup_top',
  left: 'DrControlGroup_left',
  auto: 'DrControlGroup_auto',
} as const satisfies Record<DrControlGroupLabelPosition, string>;

const rootStyles = computed(() => ({
  '--dr-control-group-label-width': props.labelWidth,
  '--dr-control-group-label-align': props.labelAlign,
}));
</script>

<template>
  <div
    class="DrControlGroup"
    :class="[labelPositionClasses[props.labelPosition], $attrs.class]"
    :style="rootStyles"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
  .DrControlGroup_top {
    --dr-control-group-layout-columns: minmax(0, 1fr);
    --dr-control-group-layout-areas: 'label' 'control' 'message';
    --dr-control-group-layout-align-items: normal;
  }

  .DrControlGroup_left {
    --dr-control-group-layout-columns: var(--dr-control-group-label-width, max-content) minmax(0, 1fr);
    --dr-control-group-layout-areas: 'label control' '. message';
    --dr-control-group-layout-align-items: first baseline;
  }

  .DrControlGroup_auto {
    --dr-control-group-layout-columns: minmax(0, 1fr);
    --dr-control-group-layout-areas: 'label' 'control' 'message';
    --dr-control-group-layout-align-items: normal;
  }

  @media (width >= 640px) {
    .DrControlGroup_auto {
      --dr-control-group-layout-columns: var(--dr-control-group-label-width, max-content) minmax(0, 1fr);
      --dr-control-group-layout-areas: 'label control' '. message';
      --dr-control-group-layout-align-items: first baseline;
    }
  }
</style>
