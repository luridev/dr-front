<script setup lang="ts">
import { computed, useId } from 'vue';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type {
  DrButtonEmits,
  DrButtonProps,
  DrButtonSize,
  DrButtonState,
  DrButtonVariant,
} from '@/actions/components/DrButton/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrButtonProps>(), {
  type: 'button',
  state: 'normal',
  variant: 'outline',
  size: 'medium',
  disabled: false,
  loading: false,
});

const emit = defineEmits<DrButtonEmits>();

const sizeClasses = {
  small: 'DrButton_size_small',
  medium: 'DrButton_size_medium',
  large: 'DrButton_size_large',
} as const satisfies Record<DrButtonSize, string>;

const variantClasses = {
  solid: 'DrButton_variant_solid',
  outline: 'DrButton_variant_outline',
  ghost: 'DrButton_variant_ghost',
} as const satisfies Record<DrButtonVariant, string>;

const stateClasses = {
  normal: 'DrButtonRoot_state_normal',
  warning: 'DrButtonRoot_state_warning',
  danger: 'DrButtonRoot_state_danger',
} as const satisfies Record<DrButtonState, string>;

const messageId = useId();

const messages = computed<ReadonlyArray<string>>(() =>
  (typeof props.message === 'string' ? [props.message] : (props.message ?? [])).filter(isNonBlankString),
);

const hasMessage = computed(() => messages.value.length > 0);
const isDisabled = computed(() => props.disabled || props.loading);

const describedBy = computed(() => {
  const ids = [props.aria?.ariaDescribedBy, hasMessage.value ? messageId : undefined].filter(isNonBlankString);

  return ids.length === 0 ? undefined : ids.join(' ');
});

const rootClasses = computed(() => [
  stateClasses[props.state],
  {
    DrButtonRoot_withMessage: hasMessage.value,
  },
]);

const buttonClasses = computed(() => [
  variantClasses[props.variant],
  sizeClasses[props.size],
  {
    DrButton_loading: props.loading,
  },
]);

function handlePointerdown(event: PointerEvent) {
  emit('pointerdown', event);
}

function handleClick(event: MouseEvent) {
  emit('click', event);
}
</script>

<template>
  <span
    class="DrButtonRoot"
    :class="[rootClasses, $attrs.class]"
  >
    <button
      :id="props.id"
      class="DrButton"
      :class="buttonClasses"
      :type="props.type"
      :disabled="isDisabled"
      :aria-busy="props.loading || undefined"
      :aria-label="props.aria?.ariaLabel"
      :aria-describedby="describedBy"
      :aria-invalid="props.aria?.ariaInvalid || undefined"
      @pointerdown="handlePointerdown"
      @click="handleClick"
    >
      <slot></slot>
    </button>

    <span
      v-if="hasMessage"
      :id="messageId"
      class="DrButtonRoot__message"
    >
      <span
        v-for="(messageText, index) in messages"
        :key="index"
        class="DrButtonRoot__messageItem"
      >
        {{ messageText }}
      </span>
    </span>
  </span>
</template>

<style scoped>
  .DrButtonRoot {
    display: inline-grid;
    justify-items: center;
    width: fit-content;
    min-width: 0;
  }

  .DrButtonRoot_withMessage {
    width: 100%;
    gap: var(--dr-space-xsmall);
  }

  .DrButtonRoot_state_normal {
    --dr-button-solid-border-color: var(--dr-color-border-accent);
    --dr-button-solid-background: var(--dr-color-background-accent);
    --dr-button-solid-color: var(--dr-color-text-accent);
    --dr-button-outline-border-color: var(--dr-color-border-secondary);
    --dr-button-outline-background: var(--dr-color-background-secondary);
    --dr-button-foreground-color: var(--dr-color-text-secondary);
    --dr-button-message-color: var(--dr-color-text-secondary);
  }

  .DrButtonRoot_state_warning {
    --dr-button-solid-border-color: var(--dr-color-border-warning);
    --dr-button-solid-background: var(--dr-color-background-warning);
    --dr-button-solid-color: var(--dr-color-text-warning);
    --dr-button-outline-border-color: var(--dr-color-border-warning);
    --dr-button-outline-background: var(--dr-color-background-secondary);
    --dr-button-foreground-color: var(--dr-color-text-warning);
    --dr-button-message-color: var(--dr-color-text-warning);
  }

  .DrButtonRoot_state_danger {
    --dr-button-solid-border-color: var(--dr-color-border-danger);
    --dr-button-solid-background: var(--dr-color-background-danger);
    --dr-button-solid-color: var(--dr-color-text-danger);
    --dr-button-outline-border-color: var(--dr-color-border-danger);
    --dr-button-outline-background: var(--dr-color-background-secondary);
    --dr-button-foreground-color: var(--dr-color-text-danger);
    --dr-button-message-color: var(--dr-color-text-danger);
  }

  .DrButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--dr-space-xsmall);
    width: fit-content;
    border: 1px solid transparent;
    border-radius: var(--dr-border-radius-control);
    font: inherit;
    text-decoration: none;
    cursor: pointer;
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .DrButton:disabled {
    cursor: var(--dr-disabled-cursor);
  }

  .DrButton:disabled:not(.DrButton_loading) {
    opacity: var(--dr-opacity-50);
  }

  .DrButton:not(:disabled):hover {
    opacity: var(--dr-opacity-80);
  }

  .DrButton_size_small {
    min-height: 28px;
    padding: var(--dr-space-xsmall) var(--dr-space-small);
    font-size: var(--dr-font-size-small);
  }

  .DrButton_size_medium {
    min-height: 40px;
    padding: var(--dr-space-small) var(--dr-space-medium);
  }

  .DrButton_size_large {
    min-height: 48px;
    padding: var(--dr-space-medium) var(--dr-space-large);
    font-size: var(--dr-font-size-medium);
  }

  .DrButton_variant_solid {
    border-color: var(--dr-button-solid-border-color);
    background: var(--dr-button-solid-background);
    color: var(--dr-button-solid-color);
  }

  .DrButton_variant_outline {
    border-color: var(--dr-button-outline-border-color);
    background: var(--dr-button-outline-background);
    color: var(--dr-button-foreground-color);
  }

  .DrButton_variant_ghost {
    border-color: transparent;
    background: transparent;
    color: var(--dr-button-foreground-color);
  }

  .DrButton_loading {
    background-image: linear-gradient(
      100deg,
      transparent 20%,
      color-mix(in srgb, currentcolor 35%, transparent) 50%,
      transparent 80%
    );
    background-repeat: no-repeat;
    background-size: 200% 100%;
    cursor: progress;
    animation: loading-keyframes 1.2s linear infinite;
  }

  .DrButtonRoot__message {
    max-width: 100%;
    color: var(--dr-button-message-color);
    font-size: var(--dr-font-size-small);
    text-align: center;
    white-space: pre-line;
    overflow-wrap: anywhere;
  }

  .DrButtonRoot__messageItem {
    display: block;
  }

  @keyframes loading-keyframes {
    from {
      background-position: 200% 0;
    }

    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .DrButton_loading {
      background-image: none;
      animation: none;
      opacity: var(--dr-opacity-80);
    }
  }
</style>
