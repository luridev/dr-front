<script setup lang="ts">
import { ref } from 'vue';
import { DrInputNumber } from '@/index';

defineOptions({ inheritAttrs: false });

const quantity = ref<number | null>(3);
const temperature = ref<number | null>(-5);
const amount = ref<number | null>(null);
const disabled = ref<number | null>(42);
</script>

<template>
  <div class="GalleryExample">
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
      />

      <DrInputNumber
        v-model="disabled"
        label="Disabled"
        disabled
      />
    </div>

    <p class="GalleryExample__output">
      Quantity: {{ quantity }} · Temperature: {{ temperature }} · Optional: {{ amount ?? 'null' }}
    </p>
  </div>
</template>
