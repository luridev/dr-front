<script setup lang="ts">
import { useTemplateRef } from 'vue';
import DrIconButton from '@/actions/components/DrIconButton/DrIconButton.vue';
import DrCloseIcon from '@/icons/components/DrCloseIcon/DrCloseIcon.generated.vue';
import type { DrToastEmits, DrToastProps } from '@/feedback/toasts/components/DrToast/types';
import type { DrToastVariant } from '@/feedback/toasts/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrToastProps>();

const emit = defineEmits<DrToastEmits>();

const rootElement = useTemplateRef<HTMLElement>('rootElement');

const variantClasses = {
  info: 'DrToast_variant_info',
  success: 'DrToast_variant_success',
  warning: 'DrToast_variant_warning',
  error: 'DrToast_variant_error',
} as const satisfies Record<DrToastVariant, string>;

function handleClose() {
  emit('close', props.uid);
}

function handlePointerEnter() {
  emit('hoverChange', props.uid, true);
}

function handlePointerLeave() {
  emit('hoverChange', props.uid, false);
}

function handleFocusIn() {
  emit('focusWithinChange', props.uid, true);
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget;
  const isFocusWithin = nextTarget instanceof Node && rootElement.value?.contains(nextTarget) === true;

  emit('focusWithinChange', props.uid, isFocusWithin);
}
</script>

<template>
  <div
    ref="rootElement"
    class="DrToast"
    :class="[variantClasses[props.variant], $attrs.class]"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <span
      class="DrToast__marker"
      aria-hidden="true"
    ></span>

    <strong class="DrToast__title">
      {{ props.title }}
    </strong>

    <DrIconButton
      class="DrToast__close"
      :tabindex="props.closeButtonTabindex"
      :aria="{ ariaLabel: 'Закрыть уведомление' }"
      @click="handleClose"
    >
      <DrCloseIcon :size="16" />
    </DrIconButton>

    <p class="DrToast__message">
      {{ props.message }}
    </p>
  </div>
</template>

<style scoped>
  .DrToast {
    --dr-toast-color: var(--dr-color-text-primary);
    --dr-toast-background: var(--dr-color-background-primary);
    --dr-toast-border: var(--dr-color-border-primary);

    display: grid;
    grid-template-areas:
      'marker title close'
      '. message message';
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--dr-space-xsmall) var(--dr-space-small);
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: var(--dr-space-xsmall) var(--dr-space-small) var(--dr-space-small) var(--dr-space-medium);
    border: 1px solid var(--dr-toast-border);
    border-radius: var(--dr-border-radius-surface, 0.5rem);
    background: var(--dr-toast-background);
    box-shadow: 0 0.25rem 1rem rgb(0 0 0 / 18%);
    color: var(--dr-toast-color);
    pointer-events: auto;
  }

  .DrToast_variant_info {
    --dr-toast-color: var(--dr-color-text-primary);
    --dr-toast-background: var(--dr-color-background-primary);
    --dr-toast-border: var(--dr-color-border-primary);
  }

  .DrToast_variant_success {
    --dr-toast-color: var(--dr-color-text-success);
    --dr-toast-background: var(--dr-color-background-success);
    --dr-toast-border: var(--dr-color-border-success);
  }

  .DrToast_variant_warning {
    --dr-toast-color: var(--dr-color-text-warning);
    --dr-toast-background: var(--dr-color-background-warning);
    --dr-toast-border: var(--dr-color-border-warning);
  }

  .DrToast_variant_error {
    --dr-toast-color: var(--dr-color-text-danger);
    --dr-toast-background: var(--dr-color-background-danger);
    --dr-toast-border: var(--dr-color-border-danger);
  }

  .DrToast__marker {
    grid-area: marker;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: currentcolor;
  }

  .DrToast__title {
    grid-area: title;
    min-width: 0;
    font-weight: 600;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .DrToast__message {
    grid-area: message;
    min-width: 0;
    margin: 0;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .DrToast__close {
    display: grid;
    grid-area: close;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--dr-border-radius-control);
    opacity: var(--dr-opacity-80);
  }

  .DrToast__close:hover {
    opacity: 1;
  }

  .DrToast__close:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 1px;
    opacity: 1;
  }
</style>
