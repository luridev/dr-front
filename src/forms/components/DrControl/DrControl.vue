<script setup lang="ts">
import { computed, useId } from 'vue';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type { DrControlLabelPosition, DrControlProps } from '@/forms/components/DrControl/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrControlProps>(), {
  bordered: false,
  disabled: false,
  kind: 'field',
  state: 'normal',
});

const labelPositionClasses = {
  top: 'DrControl_top',
  left: 'DrControl_left',
  right: 'DrControl_right',
} as const satisfies Record<DrControlLabelPosition, string>;

const controlId = useId();

const messages = computed<ReadonlyArray<string>>(() =>
  (typeof props.message === 'string' ? [props.message] : (props.message ?? [])).filter(isNonBlankString),
);

const hasMessage = computed(() => messages.value.length > 0);
const isGroup = computed(() => props.kind === 'group');
const labelId = computed(() => `${controlId}-label`);
const messageId = computed(() => (hasMessage.value ? `${controlId}-message` : undefined));

const rootClasses = computed(() => [
  {
    DrControl_disabled: props.disabled,
    DrControl_group: isGroup.value,
  },
  props.labelPosition != null ? labelPositionClasses[props.labelPosition] : undefined,
]);

const labelClasses = computed(() => ({
  DrControl__label_error: props.state === 'error',
}));

const controlClasses = computed(() => ({
  DrControl__control_bordered: props.bordered,
  DrControl__control_error: props.state === 'error',
}));
</script>

<template>
  <div
    class="DrControl"
    :class="[rootClasses, $attrs.class]"
  >
    <span
      v-if="isGroup"
      :id="labelId"
      class="DrControl__label"
      :class="labelClasses"
    >
      <slot name="label"></slot>
    </span>

    <label
      v-else
      class="DrControl__label"
      :class="labelClasses"
      :for="controlId"
    >
      <slot name="label"></slot>
    </label>

    <div
      class="DrControl__control"
      :class="controlClasses"
    >
      <slot
        :id="controlId"
        :label-id="isGroup ? labelId : undefined"
        :state="props.state"
        :disabled="props.disabled"
        :described-by="messageId"
      ></slot>
    </div>

    <div
      v-if="hasMessage"
      :id="messageId"
      class="DrControl__message"
      :class="{ DrControl__message_error: props.state === 'error' }"
    >
      <div
        v-for="(messageText, index) in messages"
        :key="index"
      >
        {{ messageText }}
      </div>
    </div>
  </div>
</template>

<style scoped>
  .DrControl {
    --dr-control-label-width: var(--dr-control-group-label-width, max-content);
    --dr-control-label-align: var(--dr-control-group-label-align, left);

    --dr-control-layout-columns: var(--dr-control-group-layout-columns, minmax(0, 1fr));
    --dr-control-layout-areas: var(--dr-control-group-layout-areas, 'label' 'control' 'message');
    --dr-control-layout-align-items: var(--dr-control-group-layout-align-items, normal);

    display: grid;
    min-width: 0;
    gap: var(--dr-space-xsmall) var(--dr-space-medium);
    grid-template-columns: var(--dr-control-layout-columns);
    grid-template-areas: var(--dr-control-layout-areas);
    align-items: var(--dr-control-layout-align-items);
  }

  .DrControl_top {
    --dr-control-layout-columns: minmax(0, 1fr);
    --dr-control-layout-areas: 'label' 'control' 'message';
    --dr-control-layout-align-items: normal;
  }

  .DrControl_left {
    --dr-control-layout-columns: minmax(0, var(--dr-control-label-width)) minmax(0, 1fr);
    --dr-control-layout-areas: 'label control' '. message';
    --dr-control-layout-align-items: first baseline;
  }

  .DrControl_right {
    --dr-control-layout-columns: max-content minmax(0, 1fr);
    --dr-control-layout-areas: 'control label' '. message';
    --dr-control-layout-align-items: center;

    gap: var(--dr-space-xsmall) var(--dr-space-small);
  }

  .DrControl__label {
    grid-area: label;
    color: var(--dr-color-text-primary);
    text-align: var(--dr-control-label-align);
    cursor: pointer;
    line-height: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .DrControl_group > .DrControl__label {
    padding: 0;
    cursor: default;
  }

  .DrControl__label_error {
    color: var(--dr-color-text-danger);
  }

  .DrControl_disabled {
    cursor: var(--dr-disabled-cursor);
    opacity: var(--dr-opacity-65);

    .DrControl__label {
      cursor: var(--dr-disabled-cursor);
    }
  }

  .DrControl__control {
    grid-area: control;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .DrControl__control_bordered {
    min-height: 44px;
    color: var(--dr-color-text-primary);
    background: var(--dr-color-background-primary);
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-field);
    overflow: hidden;
    transition: border-color 0.15s ease;
  }

  .DrControl__control_bordered:focus-within {
    border-color: var(--dr-color-border-accent);
  }

  .DrControl__control_error.DrControl__control_bordered,
  .DrControl__control_error.DrControl__control_bordered:focus-within {
    border-color: var(--dr-color-border-danger);
  }

  .DrControl__message {
    grid-area: message;
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-small);
    white-space: pre-line;
  }

  .DrControl__message_error {
    color: var(--dr-color-text-danger);
  }
</style>
