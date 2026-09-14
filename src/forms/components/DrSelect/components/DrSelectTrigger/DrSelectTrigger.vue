<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import DrChevronDownIcon from '@/icons/components/DrChevronDownIcon/DrChevronDownIcon.generated.vue';
import DrChevronUpIcon from '@/icons/components/DrChevronUpIcon/DrChevronUpIcon.generated.vue';
import type {
  DrSelectTriggerEmits,
  DrSelectTriggerExposed,
  DrSelectTriggerProps,
} from '@/forms/components/DrSelect/components/DrSelectTrigger/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrSelectTriggerProps>();
const emit = defineEmits<DrSelectTriggerEmits>();

const triggerElement = useTemplateRef<HTMLButtonElement>('triggerElement');

const triggerIcon = computed(() => (props.aria.expanded ? DrChevronUpIcon : DrChevronDownIcon));

function handleClick(event: MouseEvent) {
  emit('click', event);
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event);
}

function focus(options?: FocusOptions) {
  triggerElement.value?.focus(options);
}

defineExpose<DrSelectTriggerExposed>({
  focus,
});
</script>

<template>
  <button
    :id="props.id"
    ref="triggerElement"
    class="DrSelectTrigger"
    :class="$attrs.class"
    type="button"
    role="combobox"
    :disabled="props.disabled"
    :aria-expanded="props.aria.expanded"
    :aria-controls="props.aria.controls"
    :aria-haspopup="props.aria.hasPopup"
    :aria-activedescendant="props.aria.activeDescendant"
    :aria-invalid="props.invalid || undefined"
    :aria-describedby="props.describedBy"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span
      class="DrSelectTrigger__value"
      :class="{ DrSelectTrigger__value_placeholder: props.isPlaceholder }"
    >
      <slot></slot>
    </span>

    <component
      :is="triggerIcon"
      class="DrSelectTrigger__chevron"
      :size="16"
    />
  </button>
</template>

<style scoped>
  .DrSelectTrigger {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: var(--dr-space-small) var(--dr-space-medium);
    border: 0;
    border-radius: inherit;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    gap: var(--dr-space-medium);
  }

  .DrSelectTrigger:disabled {
    cursor: var(--dr-disabled-cursor);
  }

  .DrSelectTrigger:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: -2px;
  }

  .DrSelectTrigger__value {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .DrSelectTrigger__value_placeholder,
  .DrSelectTrigger__chevron {
    color: var(--dr-color-text-secondary);
  }

  .DrSelectTrigger__chevron {
    flex: none;
  }
</style>
