<script setup lang="ts">
import { DrModalHost } from '@/index';
import type { HostProps } from '~/tests/playwright/types';

defineOptions({ inheritAttrs: false });

const props = defineProps<HostProps>();
</script>

<template>
  <DrModalHost :background-root="props.backgroundRoot" />

  <div id="root">
    <component
      :is="props.state.component"
      v-if="props.state.component"
      v-bind="props.state.props"
    />
  </div>
</template>
