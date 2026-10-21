<script setup lang="ts">
import { ref } from 'vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import DrInput from '@/forms/components/DrInput/DrInput.vue';

defineOptions({ inheritAttrs: false });

const config = useDrConfig();
const value = ref('Dialog text');
</script>

<template>
  <p data-testid="dialog-config">{{ config.language }} / {{ config.locale }}</p>

  <DrInput
    v-model="value"
    label="Dialog value"
  />
</template>
