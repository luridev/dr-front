<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { isPasteOverMaxLength } from '@/forms/lib/isPasteOverMaxLength/isPasteOverMaxLength';
import { normalizeMaxLength } from '@/forms/lib/normalizeMaxLength/normalizeMaxLength';
import type { DrTextareaBaseEmits, DrTextareaBaseProps } from '@/forms/components/DrTextareaBase/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrTextareaBaseProps>(), {
  disabled: false,
  readonly: false,
  spellCheck: undefined,
  rows: 5,
});

const emit = defineEmits<DrTextareaBaseEmits>();

const model = defineModel<string>({ required: true });

const textareaElement = useTemplateRef<HTMLTextAreaElement>('textareaElement');

const maxLength = computed(() => normalizeMaxLength(props.maxLength));

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}

function focus(options?: FocusOptions): void {
  textareaElement.value?.focus(options);
}

function handlePaste(event: ClipboardEvent) {
  if (props.readonly || props.disabled || maxLength.value == null) {
    return;
  }

  if (!isPasteOverMaxLength(event, maxLength.value)) {
    return;
  }

  event.preventDefault();
  emit('limitExceeded', maxLength.value);
}

defineExpose({
  focus,
});
</script>

<template>
  <textarea
    :id="props.id"
    ref="textareaElement"
    v-model="model"
    class="DrTextareaBase"
    :class="$attrs.class"
    :placeholder="props.placeholder"
    :rows="props.rows"
    :maxlength="maxLength"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :inputmode="props.inputMode"
    :enterkeyhint="props.enterKeyHint"
    :spellcheck="props.spellCheck"
    :autocapitalize="props.autoCapitalize"
    :autocorrect="props.autoCorrect"
    :aria-invalid="props.aria?.ariaInvalid || undefined"
    :aria-describedby="props.aria?.ariaDescribedBy"
    :data-dr-focus-target="$attrs['data-dr-focus-target']"
    @focus="handleFocus"
    @blur="handleBlur"
    @paste="handlePaste"
  ></textarea>
</template>

<style scoped>
  .DrTextareaBase {
    display: block;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: var(--dr-space-small) var(--dr-space-medium);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;

    @supports (resize: none) {
      resize: none;
    }
  }

  .DrTextareaBase:disabled {
    cursor: var(--dr-disabled-cursor);
  }
</style>
