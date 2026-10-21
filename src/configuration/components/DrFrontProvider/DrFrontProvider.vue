<script setup lang="ts">
import DrConfigProvider from '@/configuration/components/DrConfigProvider/DrConfigProvider.vue';
import DrToastHost from '@/feedback/toasts/components/DrToastHost/DrToastHost.vue';
import DrModalHost from '@/overlays/components/DrModalHost/DrModalHost.vue';
import type { DrFrontProviderProps } from '@/configuration/components/DrFrontProvider/types';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrFrontProviderProps>();
</script>

<template>
  <DrConfigProvider
    :language="props.language"
    :locale="props.locale"
    :translate="props.translate"
  >
    <DrToastHost>
      <DrModalHost :background-root="props.backgroundRoot ?? null">
        <slot></slot>
      </DrModalHost>
    </DrToastHost>
  </DrConfigProvider>
</template>
