<script setup lang="ts">
import { ref } from 'vue';
import { DrConfigProvider, DrInputNumber } from '@/index';
import type { DrLocale } from '@/configuration/types';

defineOptions({ inheritAttrs: false });

const quantity = ref<number | null>(3);
const temperature = ref<number | null>(-5);
const amount = ref<number | null>(1234567);
const disabled = ref<number | null>(42);
const locale = ref<DrLocale>('en-US');
const amountUpdates = ref(0);

function handleAmountUpdate() {
  amountUpdates.value += 1;
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
        <DrInputNumber
          v-model="quantity"
          label="Quantity"
          :min="1"
          :max="10"
          message="1–10 · Step 1"
        />

        <DrInputNumber
          v-model="temperature"
          label="Temperature"
          :min="-40"
          :max="40"
          :step="5"
          message="−40–40 · Step 5"
        />

        <DrInputNumber
          v-model="temperature"
          label="Read-only temperature"
          readonly
          clearable
          :min="-40"
          :max="40"
          :step="5"
          :aria="{ clearButtonAriaLabel: 'Clear read-only temperature' }"
          message="Mirrors Temperature"
        />

        <DrInputNumber
          v-model="amount"
          label="Optional"
          placeholder="Enter a number"
          clearable
          :aria="{ clearButtonAriaLabel: 'Clear optional number' }"
          @update:model-value="handleAmountUpdate"
        />

        <DrInputNumber
          v-model="disabled"
          label="Disabled"
          disabled
        />
      </div>
    </DrConfigProvider>

    <p class="GalleryExample__output">
      Quantity: {{ quantity }} · Temperature: {{ temperature }} · Optional:
      <span
        data-testid="number-gallery-model"
        :data-updates="amountUpdates"
      >{{ amount ?? 'null' }}</span>
    </p>
  </div>
</template>
