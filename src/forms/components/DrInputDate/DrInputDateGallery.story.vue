<script setup lang="ts">
import { computed, shallowRef, ref } from 'vue';
import { dateGalleryPartLabels, dateGalleryStatusLabels } from '@/forms/components/DrInputDate/config.support';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { DrButton, DrConfigProvider, DrInputDate } from '@/index';
import type { DrInputDateStatus, DrLocale } from '@/index';

defineOptions({ inheritAttrs: false });

const initialDate = Temporal.PlainDate.from('2026-02-01');
const date = shallowRef<Temporal.PlainDate | null>(initialDate);
const optionalDate = shallowRef<Temporal.PlainDate | null>(null);
const disabledDate = shallowRef<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-01-01'));
const locale = ref<DrLocale>('en-US');
const dateUpdates = ref(0);
const status = ref<DrInputDateStatus>('valid');
const state = computed(() => (status.value === 'invalid' || status.value === 'out-of-range' ? 'error' : 'normal'));
const message = computed(() => dateGalleryStatusLabels[status.value]);
const dateText = computed(() => date.value?.toString() ?? 'null');

const placeholder = computed(() => {
  const { order, separators } = getInputLocaleProfile(locale.value).date;

  return order.map((part, index) => dateGalleryPartLabels[part] + (separators[index] ?? '')).join('');
});

function handleDateUpdate(): void {
  dateUpdates.value += 1;
}

function handleStatusUpdate(value: DrInputDateStatus): void {
  status.value = value;
}

function handleReset(): void {
  date.value = initialDate;
}
</script>

<template>
  <div class="GalleryExample">
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
        <DrInputDate
          v-model="date"
          label="Date"
          :placeholder="placeholder"
          :state="state"
          :message="message"
          :aria="{ clearButtonAriaLabel: 'Clear date' }"
          @update:model-value="handleDateUpdate"
          @update:status="handleStatusUpdate"
        />

        <DrInputDate
          v-model="date"
          label="Read-only date"
          message="Mirrors Date"
          readonly
        />

        <DrInputDate
          v-model="optionalDate"
          label="Optional"
          :placeholder="placeholder"
          :aria="{ clearButtonAriaLabel: 'Clear optional date' }"
        />

        <DrInputDate
          v-model="disabledDate"
          label="Disabled"
          disabled
        />
      </div>
    </DrConfigProvider>

    <div class="GalleryExample__row">
      <DrButton
        variant="outline"
        @click="handleReset"
      >Reset date</DrButton>
    </div>

    <p class="GalleryExample__output">
      Date:
      <span
        data-testid="date-gallery-model"
        :data-updates="dateUpdates"
        :data-initial-identity="date === initialDate"
      >{{ dateText }}</span>
    </p>
  </div>
</template>
