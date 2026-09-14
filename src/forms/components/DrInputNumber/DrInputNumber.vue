<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from 'vue';
import DrIconButton from '@/actions/components/DrIconButton/DrIconButton.vue';
import { provideDrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/useDrInputInternalFormat';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { useDrInputNumberAria } from '@/forms/components/DrInputNumber/composables/useDrInputNumberAria/useDrInputNumberAria';
import { useDrInputNumberControls } from '@/forms/components/DrInputNumber/composables/useDrInputNumberControls/useDrInputNumberControls';
import { useDrInputNumberModel } from '@/forms/components/DrInputNumber/composables/useDrInputNumberModel/useDrInputNumberModel';
import { numberDrInputFormatSettings } from '@/forms/components/DrInputNumber/config';
import DrChevronDownIcon from '@/icons/components/DrChevronDownIcon/DrChevronDownIcon.generated.vue';
import DrChevronUpIcon from '@/icons/components/DrChevronUpIcon/DrChevronUpIcon.generated.vue';
import DrPlusMinusIcon from '@/icons/components/DrPlusMinusIcon/DrPlusMinusIcon.generated.vue';
import type { DrInputAria, DrInputExposed } from '@/forms/components/DrInput/types';
import type { DrInputNumberEmits, DrInputNumberProps } from '@/forms/components/DrInputNumber/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrInputNumberProps>(), {
  clearable: false,
  disabled: false,
  state: 'normal',
  step: 1,
});

const emit = defineEmits<DrInputNumberEmits>();

const model = defineModel<number | null>({
  required: true,
});

const drInput = useTemplateRef<DrInputExposed>('drInput');

const { inputValue, canToggleSign, updateInputValue, toggleSign, canonicalizeInputValue } = useDrInputNumberModel({
  model,
});

const {
  min,
  max,
  allowsNegative: showSignToggle,
  isBoundsValid,
  canIncrement,
  canDecrement,
  increment,
  decrement,
} = useDrInputNumberControls({
  model,
  min: () => props.min,
  max: () => props.max,
  step: () => props.step,
  disabled: () => props.disabled,
});

const { inputAria, incrementAriaLabel, decrementAriaLabel, signAriaLabel } = useDrInputNumberAria({
  model,
  inputValue,
  min,
  max,
  isBoundsValid,
  label: () => props.label,
});

const aria = computed<DrInputAria>(() => ({
  ...inputAria.value,
  role: 'spinbutton',
  clearButtonAriaLabel: props.aria?.clearButtonAriaLabel,
}));

provideDrInputInternalFormat(numberDrInputFormatSettings);

const isSignToggleDisabled = computed(() => props.disabled || !isBoundsValid.value || !canToggleSign.value);

function handleBlur(event: FocusEvent) {
  canonicalizeInputValue();
  emit('blur', event);
}

function focusInput() {
  drInput.value?.focus();
}

function setCaretToEndAfterRender() {
  void nextTick(() => {
    drInput.value?.setCaretToEnd();
  });
}

function runControlAction(action: () => boolean) {
  const changed = action();

  if (changed) {
    setCaretToEndAfterRender();
  }

  return changed;
}

function handleSignToggle() {
  focusInput();
  runControlAction(toggleSign);
}

function handleIncrement() {
  focusInput();
  runControlAction(increment);
}

function handleDecrement() {
  focusInput();
  runControlAction(decrement);
}

function hasModifier(event: KeyboardEvent | WheelEvent) {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.isComposing || hasModifier(event)) {
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    runControlAction(increment);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    runControlAction(decrement);
  }
}

function handleWheel(event: WheelEvent) {
  const input = event.currentTarget;

  if (
    !(input instanceof HTMLInputElement) ||
      document.activeElement !== input ||
      event.deltaY === 0 ||
      hasModifier(event)
  ) {
    return;
  }

  const changed = runControlAction(event.deltaY < 0 ? increment : decrement);

  if (changed) {
    event.preventDefault();
  }
}
</script>

<template>
  <DrInput
    ref="drInput"
    :class="$attrs.class"
    :model-value="inputValue"
    :label="props.label"
    :label-position="props.labelPosition"
    :placeholder="props.placeholder"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :state="props.state"
    :message="props.message"
    autocomplete="off"
    :aria="aria"
    @update:model-value="updateInputValue"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @wheel="handleWheel"
  >
    <template #label>
      <slot name="label">
        {{ props.label }}
      </slot>
    </template>

    <template #start="{ inputId }">
      <DrIconButton
        v-if="showSignToggle"
        class="DrInputNumber__signButton"
        :disabled="isSignToggleDisabled"
        :tabindex="-1"
        :aria="{
          ariaLabel: signAriaLabel,
          ariaControls: inputId,
        }"
        @pointerdown.prevent
        @click="handleSignToggle"
      >
        <DrPlusMinusIcon :size="16" />
      </DrIconButton>
    </template>

    <template #end="{ inputId }">
      <span class="DrInputNumber__stepper">
        <DrIconButton
          class="DrInputNumber__stepperButton"
          :disabled="!canIncrement"
          :tabindex="-1"
          :aria="{
            ariaLabel: incrementAriaLabel,
            ariaControls: inputId,
          }"
          @pointerdown.prevent
          @click="handleIncrement"
        >
          <DrChevronUpIcon :size="12" />
        </DrIconButton>

        <DrIconButton
          class="DrInputNumber__stepperButton"
          :disabled="!canDecrement"
          :tabindex="-1"
          :aria="{
            ariaLabel: decrementAriaLabel,
            ariaControls: inputId,
          }"
          @pointerdown.prevent
          @click="handleDecrement"
        >
          <DrChevronDownIcon :size="12" />
        </DrIconButton>
      </span>
    </template>
  </DrInput>
</template>

<style scoped>
  .DrInputNumber__signButton,
  .DrInputNumber__stepperButton {
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
    color: var(--dr-color-text-secondary);
    font: inherit;
    cursor: pointer;
    touch-action: manipulation;
  }

  .DrInputNumber__signButton {
    flex: 0 0 36px;
    align-self: stretch;
    border-inline-end: 1px solid var(--dr-color-border-primary);
    font-size: var(--dr-font-size-medium);
  }

  .DrInputNumber__stepper {
    display: grid;
    flex: 0 0 30px;
    align-self: stretch;
    border-inline-start: 1px solid var(--dr-color-border-primary);
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }

  .DrInputNumber__stepperButton + .DrInputNumber__stepperButton {
    border-top: 1px solid var(--dr-color-border-primary);
  }

  .DrInputNumber__signButton:disabled,
  .DrInputNumber__stepperButton:disabled {
    cursor: var(--dr-disabled-cursor);
    opacity: var(--dr-opacity-50);
  }

  .DrInputNumber__signButton:focus-visible,
  .DrInputNumber__stepperButton:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: -2px;
  }

  .DrInputNumber__signButton:hover:not(:disabled),
  .DrInputNumber__stepperButton:hover:not(:disabled) {
    background: var(--dr-color-background-secondary);
    color: var(--dr-color-text-primary);
  }

  .DrInputNumber__signButton:active:not(:disabled),
  .DrInputNumber__stepperButton:active:not(:disabled) {
    opacity: var(--dr-opacity-65);
  }
</style>
