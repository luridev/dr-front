<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import {
  maskingStoryInitialTime,
  maskingStoryIntegerFormat,
} from '@/forms/components/DrInput/DrInputMasking/config.support';
import DrInputDate from '@/forms/components/DrInputDate/DrInputDate.vue';
import DrInputNumber from '@/forms/components/DrInputNumber/DrInputNumber.vue';
import DrInputTime from '@/forms/components/DrInputTime/DrInputTime.vue';
import type { DrInputMaskingProps } from '@/forms/components/DrInput/DrInputMasking/types.support';

const props = withDefaults(defineProps<DrInputMaskingProps>(), {
  smallestUnit: 'minute',
  showTime: true,
  readonly: false,
  disabled: false,
});

const date = shallowRef<Temporal.PlainDate | null>(null);
const number = ref<number | null>(1234);
const dateSlot = ref('');
const integerSlot = ref('');
const numberSlot = ref('');
const nestedTime = shallowRef<Temporal.PlainTime | null>(null);
const nestedTimeSlot = ref('');
const initialTime = Temporal.PlainTime.from(maskingStoryInitialTime);
const time = shallowRef<Temporal.PlainTime | null>(initialTime);
const dateStatus = ref('empty');
const timeStatus = ref('valid');

function handleDateStatus(value: string) {
  dateStatus.value = value;
}

function handleTimeStatus(value: string) {
  timeStatus.value = value;
}

watch(() => props.externalDate, (value) => {
  if (value !== undefined) {
    date.value = value === null ? null : Temporal.PlainDate.from(value);
  }
}, { immediate: true });

watch(() => props.externalTime, (value) => {
  if (value !== undefined) {
    time.value = value === null ? null : Temporal.PlainTime.from(value);
  }
}, { immediate: true });

watch(() => props.externalNumber, (value) => {
  if (value !== undefined) {
    number.value = value;
  }
}, { immediate: true });

watch(() => props.externalInteger, (value) => {
  if (value !== undefined) {
    integerSlot.value = value;
  }
}, { immediate: true });
</script>

<template>
  <div class="DrInputMasking">
    <DrInputDate
      v-model="date"
      class="DrInputMasking__date"
      label="Date input"
      :readonly="props.readonly"
      :disabled="props.disabled"
      @update:status="handleDateStatus"
    >
      <template #end>
        <div class="DrInputMasking__slots">
          <DrInput
            v-model="dateSlot"
            class="DrInputMasking__dateSlot"
            label="Plain date slot"
          />

          <DrInput
            v-model="integerSlot"
            class="DrInputMasking__integerSlot"
            label="Integer date slot"
            :input-format="maskingStoryIntegerFormat"
            :readonly="props.readonly"
            :disabled="props.disabled"
          />

          <DrInputTime
            v-model="nestedTime"
            class="DrInputMasking__nestedTime"
            label="Nested time"
          >
            <template #end>
              <DrInput
                v-model="nestedTimeSlot"
                class="DrInputMasking__nestedTimeSlot"
                label="Plain time slot"
              />
            </template>
          </DrInputTime>
        </div>
      </template>
    </DrInputDate>

    <DrInputNumber
      v-model="number"
      class="DrInputMasking__number"
      label="Number input"
      :readonly="props.readonly"
      :disabled="props.disabled"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      clearable
    >
      <template #label>
        <DrInput
          v-model="numberSlot"
          class="DrInputMasking__numberSlot"
          label="Plain number slot"
        />
      </template>
    </DrInputNumber>

    <DrInputTime
      v-if="props.showTime"
      v-model="time"
      class="DrInputMasking__time"
      label="Reactive time"
      :readonly="props.readonly"
      :smallest-unit="props.smallestUnit"
      :disabled="props.disabled"
      @update:status="handleTimeStatus"
    />

    <div data-testid="date-model">{{ date?.toString() ?? 'null' }}</div>

    <div data-testid="number-model">{{ number }}</div>

    <div data-testid="time-model">{{ time?.toString() ?? 'null' }}</div>

    <div data-testid="time-model-identity">{{ time === initialTime }}</div>

    <div data-testid="integer-model">{{ integerSlot }}</div>

    <div data-testid="date-status">{{ dateStatus }}</div>

    <div data-testid="time-status">{{ timeStatus }}</div>
  </div>
</template>

<style scoped>
  .DrInputMasking,
  .DrInputMasking__slots {
    display: grid;
    gap: var(--dr-space-medium);
  }
</style>
