<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrInput } from '@/index';

defineOptions({ inheritAttrs: false });

const name = ref('Anna');
const email = ref('');
const address = ref('gallery');
const disabled = ref('Disabled value');
const emailState = computed(() => (email.value.includes('@') ? 'normal' : 'error'));
const emailMessage = computed(() => (emailState.value === 'error' ? 'Include an @ sign.' : 'Valid email'));
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__grid">
      <DrInput
        v-model="name"
        label="Name"
        placeholder="Your name"
        message="Clearable"
        :aria="{ clearButtonAriaLabel: 'Clear name' }"
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
  </div>
</template>

<style scoped>
  .DrInputGallery__affix {
    padding-inline: var(--dr-space-small);
    color: var(--dr-color-text-secondary);
  }
</style>
