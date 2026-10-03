<script setup lang="ts">
import { ref } from 'vue';
import { DrButton, DrInput, DrSection, toast } from '@/index';

defineOptions({ inheritAttrs: false });

const message = ref('Your changes have been saved.');

function handleInfo() {
  toast.info({ title: 'Information', message: message.value });
}

function handleSuccess() {
  toast.success({ title: 'Success', message: message.value });
}

function handleWarning() {
  toast.warning({ title: 'Warning', message: message.value });
}

function handleError() {
  toast.error({ title: 'Error', message: message.value });
}

function handleQueue() {
  toast.info({ title: 'Information', message: 'First notification: processing started.', duration: 2500 });
  toast.success({ title: 'Success', message: 'Second notification: changes saved.', duration: 2500 });
  toast.warning({ title: 'Warning', message: 'Third notification: review the result.', duration: 2500 });
}
</script>

<template>
  <div class="GalleryExample">
    <DrSection title="Notifications">
      <DrInput
        v-model="message"
        label="Message"
        :aria="{ clearButtonAriaLabel: 'Clear message' }"
      />

      <div class="GalleryExample__row">
        <DrButton @click="handleInfo">Information</DrButton>

        <DrButton
          variant="solid"
          @click="handleSuccess"
        >Success</DrButton>

        <DrButton
          state="warning"
          @click="handleWarning"
        >Warning</DrButton>

        <DrButton
          state="danger"
          @click="handleError"
        >Error</DrButton>
      </div>
    </DrSection>

    <DrSection title="Queue">
      <DrButton @click="handleQueue">Show queue</DrButton>
    </DrSection>
  </div>
</template>
