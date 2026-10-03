<script setup lang="ts">
import { ref } from 'vue';
import { DrAlert, DrInput, DrSection } from '@/index';

defineOptions({ inheritAttrs: false });

const message = ref('Your changes could not be saved.');
</script>

<template>
  <div class="GalleryExample">
    <DrSection title="Error">
      <DrInput
        v-model="message"
        label="Message"
        :aria="{ clearButtonAriaLabel: 'Clear message' }"
      />

      <DrAlert
        title="Unable to save"
        :message="message"
        note="Check your connection and try again."
      />
    </DrSection>

    <DrSection title="Warning">
      <DrAlert
        variant="warning"
        title="Unsaved changes"
        message="Closing this page will discard your changes."
        note="Save a draft before leaving."
      />
    </DrSection>

    <DrSection title="Information">
      <DrAlert
        variant="info"
        title="Ready to continue"
        message="You can now move to the next step."
      />
    </DrSection>
  </div>
</template>
