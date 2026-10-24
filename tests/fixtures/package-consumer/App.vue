<script setup lang="ts">
import { DrConfigProvider, DrButton, DrInput, DrInputDate, DrInputNumber, DrInputTime, DrMaskedInput, useDrToast, useControlsState } from '@protoapps/dr-front';
import type { DrLocale, DrTranslateOverride, DrMask, DrMaskedInputStatus, DrInputNumberStatus } from '@protoapps/dr-front';
import { DrCloseIcon } from '@protoapps/dr-front/icons';
import { ref } from 'vue';

const toast = useDrToast();
const text = ref('Package text');
const date = ref<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-12-31'));
const time = ref<Temporal.PlainTime | null>(Temporal.PlainTime.from('23:45:56.123456789'));
const number = ref<number | null>(1234567);
const numberStatus = ref<DrInputNumberStatus>('empty');
const locale = ref<DrLocale>('en-US');
const updates = ref(0);
const code = ref('001234');
const digits = ref('001234');
const digitsMask = { mask: /^\d*$/ } satisfies DrMask;
const repeatMask = { mask: 'code', blocks: { code: { mask: '0', repeat: [1, 30] } } } satisfies DrMask;
const repeated = ref('123');
const nativeNumber = ref('1');
const nativeNumberMask = { mask: Number, min: 5 } satisfies DrMask;
const nativeNumberUpdates = ref(0);
const status = ref<DrMaskedInputStatus>('empty');
const serialMask = { mask: 'HH-0000', definitions: { H: /[A-F0-9]/ } } as const satisfies DrMask;
const serial = ref('AB1234');
const controlsState = useControlsState({ controls: { date: {} }, isValid: () => date.value != null });
const translate: DrTranslateOverride = ({ language, key, params }) => language === 'ru' && key === 'input.clearNamed'
  ? `Стереть ${params.label}`
  : undefined;

function setNativeNumber() {
  nativeNumber.value = '2';
}

function showFeedback() {
  toast.info({ message: 'Package consumer notification' });
}
</script>

<template>
  <label>Locale <select v-model="locale"><option>en-US</option><option>ru-RU</option><option>en-GB</option></select></label>
  <DrConfigProvider :translate="translate" :locale="locale">
    <DrButton @click="showFeedback"><DrCloseIcon /> Feedback</DrButton>
    <DrInput v-model="text" label="Text" :aria="{ ariaInvalid: true }" />
    <DrInputDate v-model="date" label="Date" :aria="{ ariaInvalid: true }" :disabled="controlsState.controls.date.disabled" @update:model-value="updates += 1" />
    <DrInputTime v-model="time" label="Time" state="error" :aria="{ ariaInvalid: false }" @update:model-value="updates += 1" />
    <DrInputNumber v-model="number" label="Number" :min="1" :max="10" :aria="{ ariaInvalid: false }" @update:model-value="updates += 1" @update:status="numberStatus = $event" />
    <DrMaskedInput v-model="code" mask="000-000" label="Code" :aria="{ ariaInvalid: true }" @update:status="status = $event" />
    <DrMaskedInput v-model="digits" :mask="digitsMask" label="Digits" />
    <DrMaskedInput v-model="serial" :mask="serialMask" label="Serial" />
    <DrMaskedInput v-model="repeated" :mask="repeatMask" label="Repeated" />
    <DrMaskedInput v-model="nativeNumber" :mask="nativeNumberMask" label="Native number" @update:model-value="nativeNumberUpdates += 1" />
    <button @click="setNativeNumber">Set native number</button>
    <output id="native-number-model">{{ nativeNumber }}</output>
    <output id="native-number-updates">{{ nativeNumberUpdates }}</output>
    <output id="masked-models">{{ code }}|{{ digits }}|{{ serial }}|{{ repeated }}</output>
    <span>{{ status }}</span>
    <output id="models">{{ date }}|{{ time }}|{{ number }}</output>
    <output id="updates">{{ updates }}</output>
    <output id="number-status">{{ numberStatus }}</output>
  </DrConfigProvider>
</template>
