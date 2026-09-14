<script setup lang="ts">
import { DrButton, DrInputDate, toast, useControlsState } from '@protoapps/dr-front';
import { DrCloseIcon } from '@protoapps/dr-front/icons';
import { formatNumber } from '@protoapps/dr-front/lib';
import { ref } from 'vue';

const date = ref<Temporal.PlainDate | null>(null);
const controlsState = useControlsState({ controls: { date: {} }, isValid: () => date.value != null });

function showFeedback() {
  toast.info({ message: formatNumber(1234) });
}
</script>

<template>
  <DrButton @click="showFeedback"><DrCloseIcon /> Feedback</DrButton>
  <DrInputDate v-model="date" label="Date" :disabled="controlsState.controls.date.disabled" />
</template>
