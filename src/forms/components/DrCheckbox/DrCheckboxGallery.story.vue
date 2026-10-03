<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrCheckbox } from '@/index';

defineOptions({ inheritAttrs: false });

const notifications = ref(true);
const consent = ref(false);
const disabled = ref(true);
const consentState = computed(() => (consent.value ? 'normal' : 'error'));
const consentMessage = computed(() => (consent.value ? 'Accepted' : 'Required'));
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__row DrCheckboxGallery__states">
      <DrCheckbox
        v-model="notifications"
        label="Notifications"
      />

      <DrCheckbox
        v-model="consent"
        :state="consentState"
        :message="consentMessage"
      >
        <template #label>Accept <strong>terms</strong></template>
      </DrCheckbox>

      <DrCheckbox
        v-model="disabled"
        label="Disabled"
        disabled
      />
    </div>

    <p class="GalleryExample__output">
      Notifications: {{ notifications ? 'on' : 'off' }} · Terms: {{ consent ? 'accepted' : 'pending' }}
    </p>
  </div>
</template>

<style scoped>
  .DrCheckboxGallery__states {
    align-items: start;
  }
</style>
