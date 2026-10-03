<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { timeGalleryStatusLabels } from '@/forms/components/DrInputTime/config.support';
import { DrInputTime } from '@/index';
import type { DrInputTimeStatus } from '@/index';

defineOptions({ inheritAttrs: false });

const time = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('09:30'));
const preciseTime = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('12:34:56'));
const disabledTime = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('18:00'));
const status = ref<DrInputTimeStatus>('valid');
const state = computed(() => (status.value === 'invalid' ? 'error' : 'normal'));
const message = computed(() => timeGalleryStatusLabels[status.value]);
const timeText = computed(() => time.value?.toString() ?? 'null');
const preciseTimeText = computed(() => preciseTime.value?.toString() ?? 'null');

function handleStatusUpdate(value: DrInputTimeStatus): void {
  status.value = value;
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__grid">
      <DrInputTime
        v-model="time"
        label="Minutes"
        placeholder="HH:MM"
        :state="state"
        :message="message"
        :aria="{ clearButtonAriaLabel: 'Clear time' }"
        @update:status="handleStatusUpdate"
      />

      <DrInputTime
        v-model="preciseTime"
        label="Seconds"
        smallest-unit="second"
        placeholder="HH:MM:SS"
        :aria="{ clearButtonAriaLabel: 'Clear precise time' }"
      />

      <DrInputTime
        v-model="disabledTime"
        label="Disabled"
        disabled
      />
    </div>

    <p class="GalleryExample__output">Minutes: {{ timeText }} · Seconds: {{ preciseTimeText }}</p>
  </div>
</template>
