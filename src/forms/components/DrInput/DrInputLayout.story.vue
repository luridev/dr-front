<script setup lang="ts">
import { ref } from 'vue';
import DrCheckIcon from '@/icons/components/DrCheckIcon/DrCheckIcon.generated.vue';
import { DrButton, DrInput, DrMaskedInput } from '@/index';

defineOptions({ inheritAttrs: false });

const plain = ref('initial');
const address = ref('notes');
const masked = ref('123456');
const nested = ref('');
const decorated = ref('query');
const actions = ref(0);

function handleAction() {
  actions.value += 1;
}
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

    <DrInput
      v-model="decorated"
      label="Decorated"
      :clearable="false"
    >
      <template #start><DrCheckIcon :size="20" /></template>

      <template #end>
        <DrButton
          size="small"
          @click="handleAction"
        >
          Go
        </DrButton>
      </template>
    </DrInput>

    <span data-testid="masked-model">{{ masked }}</span>

    <span data-testid="slot-actions">{{ actions }}</span>
  </div>
</template>

<style scoped>
  .DrInputLayout {
    display: grid;
    gap: var(--dr-space-medium);
    grid-template-columns: minmax(0, 1fr);
  }
</style>
