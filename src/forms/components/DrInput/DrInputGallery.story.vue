<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { DrButton, DrInput } from '@/index';
import type { DrInputExposed } from '@/forms/components/DrInput/types';

defineOptions({ inheritAttrs: false });

const name = ref('Anna');
const email = ref('');
const address = ref('gallery');
const disabled = ref('Disabled value');
const nameInput = useTemplateRef<DrInputExposed>('nameInput');
const nameUpdates = ref(0);
const lastEvent = ref('');
const emailState = computed(() => (email.value.includes('@') ? 'normal' : 'error'));
const emailMessage = computed(() => (emailState.value === 'error' ? 'Include an @ sign.' : 'Valid email'));

function handleNameUpdate() {
  nameUpdates.value += 1;
}

function handleEvent(event: FocusEvent | KeyboardEvent | WheelEvent) {
  lastEvent.value = event.type;
}

function focusName() {
  nameInput.value?.focus({ preventScroll: true });
  nameInput.value?.setCaretToEnd();
}

function replaceName() {
  name.value = 'Updated by parent';
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__grid">
      <DrInput
        ref="nameInput"
        v-model="name"
        label="Name"
        placeholder="Your name"
        message="Clearable"
        :aria="{ clearButtonAriaLabel: 'Clear name' }"
        @update:model-value="handleNameUpdate"
        @blur="handleEvent"
        @keydown="handleEvent"
        @wheel="handleEvent"
      />

      <DrInput
        v-model="name"
        label="Read-only name"
        message="Mirrors Name; focus and copy remain available"
        readonly
        :aria="{ clearButtonAriaLabel: 'Clear read-only name' }"
      />

      <DrInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="name@example.com"
        :state="emailState"
        :message="emailMessage"
        :aria="{ clearButtonAriaLabel: 'Clear email' }"
      />

      <DrInput
        v-model="address"
        label="Page address"
        :clearable="false"
      >
        <template #start><span class="DrInputGallery__affix">/</span></template>

        <template #end><span class="DrInputGallery__affix">.html</span></template>
      </DrInput>

      <DrInput
        v-model="disabled"
        label="Disabled"
        disabled
      />
    </div>

    <p class="GalleryExample__output">Name: {{ name || 'empty' }} · Address: /{{ address }}.html</p>

    <DrButton @click="focusName">Focus name at end</DrButton>

    <DrButton @click="replaceName">Replace name</DrButton>

    <p data-testid="name-updates">{{ nameUpdates }}</p>

    <p data-testid="last-event">{{ lastEvent }}</p>
  </div>
</template>

<style scoped>
  .DrInputGallery__affix {
    padding-inline: var(--dr-space-small);
    color: var(--dr-color-text-secondary);
  }
</style>
