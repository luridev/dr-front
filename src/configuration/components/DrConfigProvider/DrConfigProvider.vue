<script setup lang="ts">
import { computed, provide, watchEffect } from 'vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { drConfigKey } from '@/configuration/keys';
import { resolveConfig } from '@/configuration/lib/resolveConfig/resolveConfig';
import type { DrConfigProviderProps } from '@/configuration/types';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrConfigProviderProps>();
const parent = useDrConfig();
const context = computed(() => resolveConfig(props, parent.value));

provide(drConfigKey, context);

watchEffect(() => context.value);
</script>

<template>
  <slot></slot>
</template>
