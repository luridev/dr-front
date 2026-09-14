<script setup lang="ts">
import { ref, shallowRef } from 'vue';
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
</script>

<template>
  <div class="DrInputMasking">
    <DrInputDate
      v-model="date"
      class="DrInputMasking__date"
      label="Date input"
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
      :smallest-unit="props.smallestUnit"
    />

    <div data-testid="date-model">{{ date?.toString() ?? 'null' }}</div>

    <div data-testid="number-model">{{ number }}</div>

    <div data-testid="time-model">{{ time?.toString() ?? 'null' }}</div>

    <div data-testid="time-model-identity">{{ time === initialTime }}</div>
  </div>
</template>

<style scoped>
  .DrInputMasking,
  .DrInputMasking__slots {
    display: grid;
    gap: var(--dr-space-medium);
  }
</style>
