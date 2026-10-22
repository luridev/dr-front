<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { timeGalleryStatusLabels } from '@/forms/components/DrInputTime/config.support';
import { DrConfigProvider, DrInputTime } from '@/index';
import type { DrInputTimeStatus, DrLocale } from '@/index';

defineOptions({ inheritAttrs: false });

const initialTime = Temporal.PlainTime.from('23:45:56.123456789');
const time = shallowRef<Temporal.PlainTime | null>(initialTime);
const preciseTime = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('12:34:56'));
const disabledTime = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('18:00'));
const locale = ref<DrLocale>('en-US');
const timeUpdates = ref(0);
const submissions = ref(0);
const status = ref<DrInputTimeStatus>('valid');
const state = computed(() => (status.value === 'invalid' ? 'error' : 'normal'));
const message = computed(() => timeGalleryStatusLabels[status.value]);
const timeText = computed(() => time.value?.toString() ?? 'null');
const preciseTimeText = computed(() => preciseTime.value?.toString() ?? 'null');

function handleTimeUpdate(): void {
  timeUpdates.value += 1;
}

function handleSubmit(): void {
  submissions.value += 1;
}

function handleStatusUpdate(value: DrInputTimeStatus): void {
  status.value = value;
}
</script>

<template>
  <form
    class="GalleryExample"
    data-testid="time-gallery-form"
    :data-submissions="submissions"
    @submit.prevent="handleSubmit"
  >
    <label>
      Locale
      <select v-model="locale">
        <option value="ru-RU">ru-RU</option>

        <option value="en-US">en-US</option>

        <option value="en-GB">en-GB</option>
      </select>
    </label>

    <DrConfigProvider :locale="locale">
      <div class="GalleryExample__grid">
        <DrInputTime
          v-model="time"
          label="Minutes"
          placeholder="HH:MM"
          :state="state"
          :message="message"
          :aria="{ clearButtonAriaLabel: 'Clear time' }"
          @update:model-value="handleTimeUpdate"
          @update:status="handleStatusUpdate"
        />

        <DrInputTime
          v-model="time"
          label="Read-only time"
          message="Mirrors Minutes"
          readonly
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
    </DrConfigProvider>

    <p class="GalleryExample__output">
      Minutes:
      <span
        data-testid="time-gallery-model"
        :data-updates="timeUpdates"
        :data-initial-identity="time === initialTime"
        :data-status="status"
      >{{ timeText }}</span>

      · Seconds: <span data-testid="time-gallery-seconds-model">{{ preciseTimeText }}</span>
    </p>
  </form>
</template>
