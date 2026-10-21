<script setup lang="ts">
import { ref } from 'vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { useDrToast } from '@/feedback/toasts/composables/useDrToast/useDrToast';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import type { ProviderContentProps } from '@/configuration/components/DrFrontProvider/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<ProviderContentProps>();
const config = useDrConfig();
const toast = useDrToast();
const draft = ref('');
const selected = ref('Alpha');

function notify() {
  toast.error({ message: `${props.name} notification`, duration: 6000 });
}

function queueNotification() {
  toast.success({ message: `${props.name} queued`, duration: 6000 });
}
</script>

<template>
  <p data-testid="effective-config">{{ config.language }} / {{ config.locale }}</p>

  <DrInput
    v-model="draft"
    :label="`${props.name} draft`"
  />

  <DrSelect
    v-model="selected"
    :label="`${props.name} choice`"
    :items="['Alpha', 'Beta']"
  />

  <button @click="notify">Notify</button>

  <button @click="queueNotification">Queue notification</button>
</template>
