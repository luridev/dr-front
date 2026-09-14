<script setup lang="ts">
import { computed, unref } from 'vue';
import { DrComponentSlotRenderer } from '@/dynamic-components/components/DrComponent/DrComponentSlotRenderer';
import type { DrComponentProps } from '@/dynamic-components/components/DrComponent/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrComponentProps>();

const resolvedEvents = computed(() => props.definition.events ?? {});
const resolvedSlots = computed(() => props.definition.slots ?? {});

const resolvedProps = computed(() =>
  Object.fromEntries(
    Object.entries(props.definition.props ?? {}).map(([propertyName, propertyValue]) => [
      propertyName,
      unref(propertyValue),
    ]),
  ),
);
</script>

<template>
  <component
    :is="props.definition.component"
    v-bind="resolvedProps"
    v-on="resolvedEvents"
  >
    <template
      v-for="(slot, slotName) in resolvedSlots"
      :key="slotName"
      #[slotName]="slotProperties"
    >
      <DrComponentSlotRenderer
        :slot-function="slot"
        :properties="slotProperties"
      />
    </template>
  </component>
</template>
