<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import DrIconButton from '@/actions/components/DrIconButton/DrIconButton.vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import { useDrInputEditor } from '@/forms/components/DrInput/composables/useDrInputEditor/useDrInputEditor';
import { isPasteOverMaxLength } from '@/forms/lib/isPasteOverMaxLength/isPasteOverMaxLength';
import { normalizeMaxLength } from '@/forms/lib/normalizeMaxLength/normalizeMaxLength';
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
  spellCheck: undefined,
  state: 'normal',
});

const emit = defineEmits<DrInputEmits>();

const model = defineModel<string>({ required: true });

const t = useDrTranslation();

const inputElement = useTemplateRef<HTMLInputElement>('inputElement');

const maxLength = computed(() => normalizeMaxLength(props.maxLength));

const isClearButtonVisible = computed(() =>
  props.clearable && model.value !== '' && !props.disabled && !props.readonly,
);

const clearButtonAriaLabel = computed(() =>
  resolveClearButtonAriaLabel(t, props.label, props.aria?.clearButtonAriaLabel),
);

const { handleInput, inputMode, getInputValue } = useDrInputEditor({
  input: inputElement,
  model,
  readonly: () => props.readonly || props.disabled,
});

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}

function handlePaste(event: ClipboardEvent) {
  if (props.disabled || props.readonly || maxLength.value == null || !isPasteOverMaxLength(event, maxLength.value)) {
    return;
  }

  event.preventDefault();
  emit('limitExceeded', maxLength.value);
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

function resolveAriaInvalid(state: 'normal' | 'error'): true | undefined {
  return (props.aria?.ariaInvalid ?? (state === 'error')) || undefined;
}

defineExpose({
  focus,
  setCaretToEnd,
});
</script>

<template>
  <DrControl
    class="DrInput__root"
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

      <input
        :id="slot.id"
        ref="inputElement"
        :value="getInputValue?.() ?? model"
        class="DrInput"
        :class="{ DrInput_clearable: isClearButtonVisible }"
        :type="props.type"
        :inputmode="props.inputMode ?? inputMode"
        :enterkeyhint="props.enterKeyHint"
        :spellcheck="props.spellCheck"
        :autocapitalize="props.autoCapitalize"
        :autocorrect="props.autoCorrect"
        :placeholder="props.placeholder"
        :maxlength="maxLength"
        :disabled="slot.disabled"
        :readonly="props.readonly"
        :autocomplete="props.autocomplete"
        :role="props.aria?.role"
        :aria-valuemin="props.aria?.ariaValueMin"
        :aria-valuemax="props.aria?.ariaValueMax"
        :aria-valuenow="props.aria?.ariaValueNow"
        :aria-valuetext="props.aria?.ariaValueText"
        :aria-invalid="resolveAriaInvalid(slot.state)"
        :aria-describedby="slot.describedBy"
        data-dr-focus-target
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @paste="handlePaste"
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
        data-dr-focus-inset
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
  .DrInput__root :deep(> .DrControl__control) {
    flex-wrap: wrap;
    overflow-wrap: anywhere;
  }

  :slotted(*) {
    max-width: 100%;
  }

  .DrInput {
    --dr-input-padding-end: var(--dr-space-medium);

    flex: 1 1 0;
    width: auto;

    /* Keep room for a glyph; oversized slots wrap instead of consuming the editor. */
    min-width: min(100%, calc(1em + var(--dr-space-medium) + var(--dr-input-padding-end)));
    padding: var(--dr-space-small) var(--dr-space-medium);
    padding-inline-end: var(--dr-input-padding-end);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
  }

  .DrInput_clearable {
    --dr-input-padding-end: 0px;
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

  .DrInput__clearButton:hover {
    color: var(--dr-color-text-primary);
  }

  .DrInput__clearButton:active:not(:focus-visible) {
    opacity: var(--dr-opacity-65);
  }
</style>
