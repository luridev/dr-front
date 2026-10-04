<script setup lang="ts">
import { maskito as vMaskito } from '@maskito/vue';
import { computed, useTemplateRef } from 'vue';
import DrIconButton from '@/actions/components/DrIconButton/DrIconButton.vue';
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import { useDrInputFormat } from '@/forms/components/DrInput/composables/useDrInputFormat/useDrInputFormat';
import { resolveClearButtonAriaLabel } from '@/forms/lib/resolveClearButtonAriaLabel/resolveClearButtonAriaLabel';
import DrCloseIcon from '@/icons/components/DrCloseIcon/DrCloseIcon.generated.vue';
import type { DrInputEmits, DrInputProps } from '@/forms/components/DrInput/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrInputProps>(), {
  type: 'text',
  clearable: true,
  disabled: false,
  readonly: false,
  state: 'normal',
});

const emit = defineEmits<DrInputEmits>();
const model = defineModel<string>({ required: true });

const inputElement = useTemplateRef<HTMLInputElement>('inputElement');

const { maskitoOptions, inputMode } = useDrInputFormat({
  inputFormat: () => props.inputFormat,
});

const isClearButtonVisible = computed(() =>
  props.clearable && model.value !== '' && !props.disabled && !props.readonly,
);

const clearButtonAriaLabel = computed(() =>
  resolveClearButtonAriaLabel(props.label, props.aria?.clearButtonAriaLabel),
);

function handleInput(event: Event) {
  const input = event.currentTarget;

  if (input instanceof HTMLInputElement) {
    model.value = input.value;
  }
}

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event);
}

function handleWheel(event: WheelEvent) {
  emit('wheel', event);
}

function handleClear() {
  if (props.readonly) {
    return;
  }

  model.value = '';
  inputElement.value?.focus();
}

function focus(options?: FocusOptions) {
  inputElement.value?.focus(options);
}

function setCaretToEnd() {
  const element = inputElement.value;

  if (element?.selectionStart == null) {
    return;
  }

  const caretPosition = element.value.length;

  element.setSelectionRange(caretPosition, caretPosition);
}

defineExpose({
  focus,
  setCaretToEnd,
});
</script>

<template>
  <DrControl
    :class="$attrs.class"
    :label-position="props.labelPosition"
    :disabled="props.disabled"
    :state="props.state"
    :message="props.message"
    bordered
  >
    <template #label>
      <slot name="label">
        {{ props.label }}
      </slot>
    </template>

    <template #default="slot">
      <slot
        name="start"
        :input-id="slot.id"
      ></slot>

      <!-- Maskito's own editing handlers bypass native readonly. -->
      <input
        :id="slot.id"
        ref="inputElement"
        v-maskito="props.readonly ? null : maskitoOptions"
        :value="model"
        class="DrInput"
        :class="{ DrInput_clearable: isClearButtonVisible }"
        :type="props.type"
        :inputmode="inputMode"
        :placeholder="props.placeholder"
        :disabled="slot.disabled"
        :readonly="props.readonly"
        :autocomplete="props.autocomplete"
        :role="props.aria?.role"
        :aria-valuemin="props.aria?.ariaValueMin"
        :aria-valuemax="props.aria?.ariaValueMax"
        :aria-valuenow="props.aria?.ariaValueNow"
        :aria-valuetext="props.aria?.ariaValueText"
        :aria-invalid="slot.state === 'error' || undefined"
        :aria-describedby="slot.describedBy"
        @input="handleInput"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @wheel="handleWheel"
      />

      <DrIconButton
        v-if="isClearButtonVisible"
        class="DrInput__clearButton"
        :aria="{
          ariaLabel: clearButtonAriaLabel,
          ariaControls: slot.id,
        }"
        @pointerdown.prevent
        @click="handleClear"
      >
        <DrCloseIcon :size="20" />
      </DrIconButton>

      <slot
        name="end"
        :input-id="slot.id"
      ></slot>
    </template>
  </DrControl>
</template>

<style scoped>
  .DrInput {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    padding: var(--dr-space-small) var(--dr-space-medium);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }

  .DrInput_clearable {
    padding-inline-end: 0;
  }

  .DrInput:disabled {
    cursor: var(--dr-disabled-cursor);
  }

  .DrInput__clearButton {
    box-sizing: border-box;
    display: inline-flex;
    flex: 0 0 auto;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: var(--dr-space-small) var(--dr-space-small) var(--dr-space-small) var(--dr-space-xsmall);
    border: none;
    background: transparent;
    color: var(--dr-color-text-secondary);
    cursor: pointer;
  }

  .DrInput__clearButton:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: -2px;
  }

  .DrInput__clearButton:hover {
    color: var(--dr-color-text-primary);
  }

  .DrInput__clearButton:active {
    opacity: var(--dr-opacity-65);
  }
</style>
