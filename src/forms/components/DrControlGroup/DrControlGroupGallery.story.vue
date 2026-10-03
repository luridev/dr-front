<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrButton, DrCheckbox, DrControlGroup, DrInput, useControlsState } from '@/index';

defineOptions({ inheritAttrs: false });

const name = ref('');
const email = ref('');
const disabled = ref(false);
const submitted = ref(false);
const isNameValid = computed(() => name.value.trim().length >= 2);
const isEmailValid = computed(() => email.value.includes('@'));
const isValid = computed(() => isNameValid.value && isEmailValid.value);

const { controls, showValidationErrors, resetControlsState, hasVisibleValidationErrors } = useControlsState({
  isDisabled: () => disabled.value,
  isValid: () => isValid.value,
  controls: {
    name: {
      normalState: () => ({ messages: ['2 characters min'] }),
      errorState: () => (isNameValid.value ? undefined : { messages: ['Enter at least 2 characters.'] }),
    },
    email: {
      errorState: () => (isEmailValid.value ? undefined : { messages: ['Include an @ sign.'] }),
    },
  },
});

const result = computed(() => {
  if (hasVisibleValidationErrors.value) {
    return 'Check the highlighted fields.';
  }

  return submitted.value ? 'Valid form' : 'Ready to validate';
});

function handleSubmit(): void {
  showValidationErrors();
  submitted.value = isValid.value;
}

function handleReset(): void {
  name.value = '';
  email.value = '';
  submitted.value = false;
  resetControlsState();
}
</script>

<template>
  <form
    class="GalleryExample"
    @submit.prevent="handleSubmit"
  >
    <DrControlGroup
      class="GalleryExample"
      label-position="auto"
      label-width="9rem"
    >
      <DrInput
        v-model="name"
        label="Name"
        :disabled="controls.name.disabled"
        :state="controls.name.state"
        :message="controls.name.messages"
        :aria="{ clearButtonAriaLabel: 'Clear name' }"
      />

      <DrInput
        v-model="email"
        label="Email"
        :disabled="controls.email.disabled"
        :state="controls.email.state"
        :message="controls.email.messages"
        :aria="{ clearButtonAriaLabel: 'Clear email' }"
      />
    </DrControlGroup>

    <div class="GalleryExample__row">
      <DrCheckbox
        v-model="disabled"
        label="Disabled"
      />

      <DrButton
        type="submit"
        :disabled="disabled"
      >Validate</DrButton>

      <DrButton
        variant="outline"
        @click="handleReset"
      >Reset</DrButton>
    </div>

    <p class="GalleryExample__output">{{ result }}</p>
  </form>
</template>
