<script setup lang="ts">
import type { DrIconButtonEmits, DrIconButtonProps, DrIconButtonSlots } from '@/actions/components/DrIconButton/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrIconButtonProps>(), {
  disabled: false,
});

const emit = defineEmits<DrIconButtonEmits>();

defineSlots<DrIconButtonSlots>();

function handlePointerdown(event: PointerEvent) {
  emit('pointerdown', event);
}

function handleClick(event: MouseEvent) {
  emit('click', event);
}
</script>

<template>
  <button
    class="DrIconButton"
    :class="$attrs.class"
    type="button"
    :disabled="props.disabled"
    :tabindex="props.tabindex"
    :aria-label="props.aria.ariaLabel"
    :aria-controls="props.aria.ariaControls"
    @pointerdown="handlePointerdown"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
  :where(.DrIconButton) {
    box-sizing: border-box;
    display: inline-flex;
    min-width: 0;
    min-height: 0;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
</style>
