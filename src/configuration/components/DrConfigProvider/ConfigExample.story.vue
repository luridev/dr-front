<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import ConfigDialogContent from '@/configuration/components/DrConfigProvider/ConfigDialogContent.story.vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import DrAlert from '@/feedback/components/DrAlert/DrAlert.vue';
import { useDrToast } from '@/feedback/toasts/composables/useDrToast/useDrToast';
import DrFilePickerButton from '@/forms/components/DrFilePickerButton/DrFilePickerButton.vue';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import DrInputDate from '@/forms/components/DrInputDate/DrInputDate.vue';
import DrInputNumber from '@/forms/components/DrInputNumber/DrInputNumber.vue';
import DrInputTime from '@/forms/components/DrInputTime/DrInputTime.vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import DrTextarea from '@/forms/components/DrTextarea/DrTextarea.vue';

defineOptions({ inheritAttrs: false });

const config = useDrConfig();
const toast = useDrToast();
const dialog = useDialog({ title: 'Configured dialog', component: ConfigDialogContent });
const text = ref('Application text');
const notes = ref('Application notes');
const number = ref<number | null>(null);
const date = shallowRef<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-02-01'));
const time = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('23:15:42.123456789'));
const selection = ref('Alpha');
const emptySelection = ref<string>();

function handleOpenDialog() {
  dialog.open();
}

function showAutomaticToast() {
  toast.error({ message: 'Application message', duration: 6000 });
}

function showQueuedToast() {
  toast.success({ message: 'Queued message', duration: 6000 });
}

function showExplicitToast() {
  toast.info({ title: 'Application title', message: 'Explicit message', duration: 6000 });
}
</script>

<template>
  <p data-testid="resolved-config">{{ config.language }} / {{ config.locale }}</p>

  <DrInput
    v-model="text"
    label="Email"
  />

  <DrInput
    v-model="text"
    label="Explicit aria"
    :aria="{ clearButtonAriaLabel: 'Application clear' }"
  />

  <DrInputNumber
    v-model="number"
    label="Count"
  />

  <DrInputDate
    v-model="date"
    label="Date"
  />

  <DrInputTime
    v-model="time"
    label="Time"
  />

  <DrTextarea
    v-model="notes"
    label="Notes"
  />

  <DrFilePickerButton />

  <DrSelect
    v-model="selection"
    :items="['Alpha', 'Beta']"
  />

  <DrSelect
    v-model="emptySelection"
    :items="[]"
  />

  <DrAlert message="Application error details" />

  <button @click="showAutomaticToast">Automatic toast</button>

  <button @click="showQueuedToast">Queue toast</button>

  <button @click="showExplicitToast">Explicit toast</button>

  <button @click="handleOpenDialog">Open dialog</button>
</template>
