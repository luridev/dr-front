<script setup lang="ts">
import { DrButton, DrInputDate, DrMaskedInput, useDrToast, useControlsState } from '@protoapps/dr-front';
import type { DrMask, DrMaskedInputStatus } from '@protoapps/dr-front';
import { DrCloseIcon } from '@protoapps/dr-front/icons';
import { formatNumber } from '@protoapps/dr-front/lib';
import { ref } from 'vue';

const toast = useDrToast();
const date = ref<Temporal.PlainDate | null>(null);
const code = ref('001234');
const integer = ref('-1234');
const status = ref<DrMaskedInputStatus>('empty');
const serialMask = { pattern: 'HH-0000', definitions: { H: /[A-F0-9]/ } } as const satisfies DrMask;
const serial = ref('AB1234');
const controlsState = useControlsState({ controls: { date: {} }, isValid: () => date.value != null });

function showFeedback() {
  toast.info({ message: formatNumber(1234) });
}
</script>

<template>
  <DrButton @click="showFeedback"><DrCloseIcon /> Feedback</DrButton>
  <DrInputDate v-model="date" label="Date" :disabled="controlsState.controls.date.disabled" />
  <DrMaskedInput v-model="code" mask="000-000" label="Code" @update:status="status = $event" />
  <DrMaskedInput v-model="integer" :mask="{ type: 'integer' }" label="Integer" />
  <DrMaskedInput v-model="serial" :mask="serialMask" label="Serial" />
  <span>{{ status }}</span>
</template>
