<script setup lang="ts">
import { computed } from 'vue';
import { defaultDrAlertTitle } from '@/feedback/config';
import type { DrAlertProps } from '@/feedback/components/DrAlert/types';
import type { DrAlertVariant } from '@/feedback/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrAlertProps>(), {
  variant: 'error',
  title: defaultDrAlertTitle,
});

const variantClasses = {
  error: 'DrAlert_variant_error',
  warning: 'DrAlert_variant_warning',
  info: 'DrAlert_variant_info',
} as const satisfies Record<DrAlertVariant, string>;

const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'));
</script>

<template>
  <div
    class="DrAlert"
    :class="[variantClasses[props.variant], $attrs.class]"
    :role="role"
  >
    <p class="DrAlert__title">
      {{ props.title }}
    </p>

    <p class="DrAlert__message">
      {{ props.message }}
    </p>

    <p
      v-if="props.note"
      class="DrAlert__note"
    >
      {{ props.note }}
    </p>
  </div>
</template>

<style scoped>
  .DrAlert {
    box-sizing: border-box;
    display: grid;
    place-items: center;
    align-content: center;
    width: 100%;
    margin: 0;
    padding: var(--dr-space-small) var(--dr-space-medium);
    text-align: center;
  }

  .DrAlert__title {
    margin: 0;
    font-size: var(--dr-font-size-medium);
    font-weight: 700;
  }

  .DrAlert__message {
    margin: var(--dr-space-xsmall) 0 0;
    font-family: var(--dr-font-family-mono);
    font-size: var(--dr-font-size-medium);
    overflow-wrap: anywhere;
    white-space: pre-line;
  }

  .DrAlert__note {
    margin: var(--dr-space-xsmall) 0 0;
    font-size: var(--dr-font-size-small);
  }

  .DrAlert_variant_error .DrAlert__title,
  .DrAlert_variant_error .DrAlert__message,
  .DrAlert_variant_error .DrAlert__note {
    color: var(--dr-color-text-danger);
  }

  .DrAlert_variant_warning .DrAlert__title,
  .DrAlert_variant_warning .DrAlert__message,
  .DrAlert_variant_warning .DrAlert__note {
    color: var(--dr-color-text-warning);
  }

  .DrAlert_variant_info .DrAlert__title {
    color: var(--dr-color-text-primary);
  }

  .DrAlert_variant_info .DrAlert__message,
  .DrAlert_variant_info .DrAlert__note {
    color: var(--dr-color-text-secondary);
  }
</style>
