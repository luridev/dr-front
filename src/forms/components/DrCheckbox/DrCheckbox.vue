<script setup lang="ts">
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import type { DrCheckboxProps } from '@/forms/components/DrCheckbox/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrCheckboxProps>(), {
  labelPosition: 'right',
  disabled: false,
  state: 'normal',
});

const model = defineModel<boolean>({
  required: true,
});
</script>

<template>
  <DrControl
    :label-position="props.labelPosition"
    :disabled="props.disabled"
    :state="props.state"
    :message="props.message"
    class="DrCheckbox__wrapper"
    :class="$attrs.class"
  >
    <template #label>
      <slot name="label">
        {{ props.label }}
      </slot>
    </template>

    <template #default="slot">
      <input
        :id="slot.id"
        v-model="model"
        class="DrCheckbox"
        type="checkbox"
        :disabled="slot.disabled"
        :aria-invalid="slot.state === 'error' || undefined"
        :aria-describedby="slot.describedBy"
      />
    </template>
  </DrControl>
</template>

<style scoped>
  .DrCheckbox__wrapper {
    padding: var(--dr-space-small) 0;
  }

  .DrCheckbox {
    display: grid;
    flex: none;
    place-content: center;
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    margin: 0;
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-control);
    appearance: none;
    background: var(--dr-color-background-primary);
    color: var(--dr-color-text-accent);
    cursor: pointer;
    padding: var(--dr-space-small);
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      outline-color 0.15s ease;
  }

  .DrCheckbox:disabled {
    cursor: var(--dr-disabled-cursor);
  }

  .DrCheckbox::before {
    width: 10px;
    height: 6px;
    border-bottom: 2px solid currentcolor;
    border-left: 2px solid currentcolor;
    content: '';
    transform: translateY(-1px) rotate(-45deg) scale(0);
    transition: transform 0.1s ease;
  }

  .DrCheckbox:checked {
    border-color: var(--dr-color-border-accent);
    background: var(--dr-color-background-accent);
  }

  .DrCheckbox:checked::before {
    transform: translateY(-1px) rotate(-45deg) scale(1);
  }

  .DrCheckbox[aria-invalid='true'] {
    border-color: var(--dr-color-border-danger);
  }

  .DrCheckbox:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: 2px;
  }

  .DrCheckbox[aria-invalid='true']:focus-visible {
    outline-color: var(--dr-color-border-danger);
  }
</style>
