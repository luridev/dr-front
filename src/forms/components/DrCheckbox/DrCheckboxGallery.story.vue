<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DrCheckbox } from '@/index';
import type { DrCheckboxGalleryProps } from '@/forms/components/DrCheckbox/types.support';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrCheckboxGalleryProps>(), {
  externalConsent: undefined,
});

const notifications = ref(true);
const consent = ref(false);
const disabledValue = ref(true);
const consentState = computed(() => (consent.value ? 'normal' : 'error'));
const consentMessage = computed(() => (consent.value ? 'Accepted' : 'Required'));

watch(() => props.externalConsent, (value) => {
  if (value !== undefined) {
    consent.value = value;
  }
}, { immediate: true });
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
        :disabled="props.disabled"
      >
        <template #label>Accept <strong>terms</strong></template>
      </DrCheckbox>

      <DrCheckbox
        v-model="disabledValue"
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
