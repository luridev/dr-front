<script setup lang="ts">
import { computed, shallowRef, ref } from 'vue';
import { dateGalleryStatusLabels } from '@/forms/components/DrInputDate/config.support';
import { DrButton, DrInputDate } from '@/index';
import type { DrInputDateStatus } from '@/index';

defineOptions({ inheritAttrs: false });

const date = shallowRef<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-10-03'));
const optionalDate = shallowRef<Temporal.PlainDate | null>(null);
const disabledDate = shallowRef<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-01-01'));
const status = ref<DrInputDateStatus>('valid');
const state = computed(() => (status.value === 'invalid' || status.value === 'out-of-range' ? 'error' : 'normal'));
const message = computed(() => dateGalleryStatusLabels[status.value]);
const dateText = computed(() => date.value?.toString() ?? 'null');

function handleStatusUpdate(value: DrInputDateStatus): void {
  status.value = value;
}

function handleReset(): void {
  date.value = Temporal.PlainDate.from('2026-10-03');
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__grid">
      <DrInputDate
        v-model="date"
        label="Date"
        placeholder="DD.MM.YYYY"
        :state="state"
        :message="message"
        :aria="{ clearButtonAriaLabel: 'Clear date' }"
        @update:status="handleStatusUpdate"
      />

      <DrInputDate
        v-model="optionalDate"
        label="Optional"
        placeholder="DD.MM.YYYY"
        :aria="{ clearButtonAriaLabel: 'Clear optional date' }"
      />

      <DrInputDate
        v-model="disabledDate"
        label="Disabled"
        disabled
      />
    </div>

    <div class="GalleryExample__row">
      <DrButton
        variant="outline"
        @click="handleReset"
      >Reset date</DrButton>
    </div>

    <p class="GalleryExample__output">Date: {{ dateText }}</p>
  </div>
</template>
