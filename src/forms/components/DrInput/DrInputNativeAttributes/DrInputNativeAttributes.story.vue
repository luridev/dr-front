<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { DrConfigProvider, DrInput, DrInputDate, DrInputNumber, DrInputTime, DrMaskedInput } from '@/index';
import type {
  DrInputNativeAttributesField,
  DrInputNativeAttributesFocus,
  DrInputNativeAttributesProps,
} from '@/forms/components/DrInput/DrInputNativeAttributes/types.support';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrInputNativeAttributesProps>(), {
  overrideAttrs: false,
});

const plain = ref('Initial');
const masked = ref('123456');
const number = ref<number | null>(1234);
const date = shallowRef<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-10-27'));
const time = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('13:45'));
const focusEvents = ref<Array<DrInputNativeAttributesFocus>>([]);
const submissions = ref<Array<string>>([]);

const nativeAttributes = computed(() => props.overrideAttrs
  ? {
      autocomplete: 'section-checkout shipping tel',
      inputMode: 'tel',
      enterKeyHint: 'send',
    } as const
  : {});

const textAttributes = computed(() => props.overrideAttrs
  ? {
      ...nativeAttributes.value,
      spellCheck: false,
      autoCapitalize: 'characters',
      autoCorrect: 'off',
    } as const
  : {});

const focusEventsText = computed(() => JSON.stringify(focusEvents.value));
const lastSubmission = computed(() => submissions.value.at(-1) ?? '');
let nativeFocus: FocusEvent | undefined;

function handleNativeFocus(event: FocusEvent) {
  nativeFocus = event;
}

function handleFocus(field: DrInputNativeAttributesField, event: FocusEvent) {
  focusEvents.value.push({
    field,
    native: event instanceof FocusEvent && event === nativeFocus,
    fromInput: event.target instanceof HTMLInputElement,
  });
}

function handlePlainFocus(event: FocusEvent) {
  handleFocus('plain', event);
}

function handleMaskedFocus(event: FocusEvent) {
  handleFocus('masked', event);
}

function handleNumberFocus(event: FocusEvent) {
  handleFocus('number', event);
}

function handleDateFocus(event: FocusEvent) {
  handleFocus('date', event);
}

function handleTimeFocus(event: FocusEvent) {
  handleFocus('time', event);
}

function handleSubmit() {
  submissions.value.push(JSON.stringify({
    plain: plain.value,
    masked: masked.value,
    number: number.value,
    date: date.value?.toString() ?? null,
    time: time.value?.toString() ?? null,
  }));
}
</script>

<template>
  <DrConfigProvider
    language="en"
    locale="en-US"
  >
    <form
      class="GalleryExample"
      @focus.capture="handleNativeFocus"
      @submit.prevent="handleSubmit"
    >
      <div class="GalleryExample__grid">
        <DrInput
          v-model="plain"
          v-bind="textAttributes"
          class="DrInputNativeAttributes__plain"
          label="Plain"
          @focus="handlePlainFocus"
        />

        <DrMaskedInput
          v-model="masked"
          v-bind="textAttributes"
          class="DrInputNativeAttributes__masked"
          label="Masked"
          mask="000-000"
          @focus="handleMaskedFocus"
        />

        <DrInputNumber
          v-model="number"
          v-bind="nativeAttributes"
          class="DrInputNativeAttributes__number"
          label="Number"
          @focus="handleNumberFocus"
        />

        <DrInputDate
          v-model="date"
          v-bind="nativeAttributes"
          class="DrInputNativeAttributes__date"
          label="Date"
          @focus="handleDateFocus"
        />

        <DrInputTime
          v-model="time"
          v-bind="nativeAttributes"
          class="DrInputNativeAttributes__time"
          label="Time"
          @focus="handleTimeFocus"
        />
      </div>

      <button type="submit">Submit models</button>

      <p data-testid="focus-events">{{ focusEventsText }}</p>

      <p data-testid="submissions">{{ submissions.length }}</p>

      <p data-testid="last-submission">{{ lastSubmission }}</p>
    </form>
  </DrConfigProvider>
</template>
