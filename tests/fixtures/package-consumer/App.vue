<script setup lang="ts">
import { DrConfigProvider, DrButton, DrInputDate, DrInputNumber, DrInputTime, DrMaskedInput, useDrToast, useControlsState } from '@protoapps/dr-front';
import type { DrLocale, DrTranslateOverride, DrMask, DrMaskedInputStatus } from '@protoapps/dr-front';
import { DrCloseIcon } from '@protoapps/dr-front/icons';
import { ref } from 'vue';

const toast = useDrToast();
const date = ref<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-12-31'));
const time = ref<Temporal.PlainTime | null>(Temporal.PlainTime.from('23:45:56.123456789'));
const number = ref<number | null>(1234567);
const locale = ref<DrLocale>('en-US');
const updates = ref(0);
const code = ref('001234');
const integer = ref('-1234');
const status = ref<DrMaskedInputStatus>('empty');
const serialMask = { pattern: 'HH-0000', definitions: { H: /[A-F0-9]/ } } as const satisfies DrMask;
const serial = ref('AB1234');
const controlsState = useControlsState({ controls: { date: {} }, isValid: () => date.value != null });
const translate: DrTranslateOverride = ({ language, key, params }) => language === 'ru' && key === 'input.clearNamed'
  ? `Стереть ${params.label}`
  : undefined;

function showFeedback() {
  toast.info({ message: 'Package consumer notification' });
}
</script>

<template>
  <label>Locale <select v-model="locale"><option>en-US</option><option>ru-RU</option><option>en-GB</option></select></label>
  <DrConfigProvider :translate="translate" :locale="locale">
    <DrButton @click="showFeedback"><DrCloseIcon /> Feedback</DrButton>
    <DrInputDate v-model="date" label="Date" :disabled="controlsState.controls.date.disabled" @update:model-value="updates += 1" />
    <DrInputTime v-model="time" label="Time" @update:model-value="updates += 1" />
    <DrInputNumber v-model="number" label="Number" @update:model-value="updates += 1" />
    <DrMaskedInput v-model="code" mask="000-000" label="Code" @update:status="status = $event" />
    <DrMaskedInput v-model="integer" :mask="{ type: 'integer' }" label="Integer" />
    <DrMaskedInput v-model="serial" :mask="serialMask" label="Serial" />
    <span>{{ status }}</span>
    <output id="models">{{ date }}|{{ time }}|{{ number }}</output>
    <output id="updates">{{ updates }}</output>
  </DrConfigProvider>
</template>
