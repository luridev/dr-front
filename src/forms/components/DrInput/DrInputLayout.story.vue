<script setup lang="ts">
import { ref } from 'vue';
import { DrInput, DrMaskedInput } from '@/index';

defineOptions({ inheritAttrs: false });

const plain = ref('initial');
const address = ref('notes');
const masked = ref('123456');
const nested = ref('');
</script>

<template>
  <div
    class="DrInputLayout"
    data-testid="layout"
  >
    <DrInput
      v-model="plain"
      label="Plain"
    />

    <DrInput
      v-model="address"
      label="Address"
      :clearable="false"
    >
      <template #start><span>https://</span></template>

      <template #end>verylongunbrokendomainname.example</template>
    </DrInput>

    <DrMaskedInput
      v-model="masked"
      label="Masked"
      mask="000-000"
    >
      <template #start><span>#</span></template>

      <template #end>
        <DrInput
          v-model="nested"
          label="Nested"
          :clearable="false"
        />
      </template>
    </DrMaskedInput>

    <DrInput
      v-model="plain"
      label="Readonly"
      readonly
    />

    <DrInput
      v-model="plain"
      label="Disabled"
      disabled
    />

    <span data-testid="masked-model">{{ masked }}</span>
  </div>
</template>

<style scoped>
  .DrInputLayout {
    display: grid;
    gap: var(--dr-space-medium);
    grid-template-columns: minmax(0, 1fr);
  }
</style>
