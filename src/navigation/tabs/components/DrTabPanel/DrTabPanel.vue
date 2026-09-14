<script setup lang="ts" generic="T extends string">
import { computed } from 'vue';
import { getTabId } from '@/navigation/tabs/lib/getTabId/getTabId';
import { getTabPanelId } from '@/navigation/tabs/lib/getTabPanelId/getTabPanelId';
import type { DrTabPanelProps } from '@/navigation/tabs/components/DrTabPanel/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrTabPanelProps<T>>();

const panelId = computed(() => getTabPanelId(props.switcherId, props.panelId));

const labelledBy = computed(() => getTabId(props.switcherId, props.panelId));

const isVisible = computed(() => props.current === props.panelId);
</script>

<template>
  <section
    v-show="isVisible"
    :id="panelId"
    :class="$attrs.class"
    role="tabpanel"
    :aria-labelledby="labelledBy"
  >
    <slot></slot>
  </section>
</template>
